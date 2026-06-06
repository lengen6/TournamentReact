const { playTimerAudioCue } = require('../test-dist/hooks/useTimerAudioCue.js')

const installAudioMock = (playFactory = () => jest.fn(() => Promise.resolve())) => {
  const instances = []

  class MockAudio {
    constructor(src) {
      this.src = src
      this.currentTime = 12
      this.preload = ''
      this.setAttribute = jest.fn()
      this.pause = jest.fn()
      this.load = jest.fn()
      this.removeAttribute = jest.fn((attributeName) => {
        if (attributeName === 'src') {
          this.src = ''
        }
      })
      this.play = playFactory(this)
      this.listeners = new Map()
      this.addEventListener = jest.fn((eventName, listener) => {
        this.listeners.set(eventName, listener)
      })
      this.removeEventListener = jest.fn((eventName, listener) => {
        if (this.listeners.get(eventName) === listener) {
          this.listeners.delete(eventName)
        }
      })

      instances.push(this)
    }

    emit(eventName) {
      this.listeners.get(eventName)?.()
    }
  }

  global.Audio = MockAudio

  return instances
}

afterEach(() => {
  jest.useRealTimers()
  delete global.Audio
})

test('creates a fresh audio stream for a timer cue', async () => {
  const audioInstances = installAudioMock()

  const cuePromise = playTimerAudioCue('/start_gong.mp3')

  expect(audioInstances).toHaveLength(1)
  expect(audioInstances[0].src).toBe('/start_gong.mp3')
  expect(audioInstances[0].preload).toBe('auto')
  expect(audioInstances[0].setAttribute).toHaveBeenCalledWith('playsinline', '')
  expect(audioInstances[0].currentTime).toBe(0)
  expect(audioInstances[0].play).toHaveBeenCalledTimes(1)

  audioInstances[0].emit('ended')
  await cuePromise
})

test('cleans up the audio stream after playback ends', async () => {
  const audioInstances = installAudioMock()

  const cuePromise = playTimerAudioCue('/end_gong.mp3')
  const audioElement = audioInstances[0]

  audioElement.emit('ended')
  await cuePromise

  expect(audioElement.removeEventListener).toHaveBeenCalledWith(
    'ended',
    expect.any(Function),
  )
  expect(audioElement.removeEventListener).toHaveBeenCalledWith(
    'error',
    expect.any(Function),
  )
  expect(audioElement.pause).toHaveBeenCalledTimes(1)
  expect(audioElement.removeAttribute).toHaveBeenCalledWith('src')
  expect(audioElement.load).toHaveBeenCalledTimes(1)
  expect(audioElement.src).toBe('')
})

test('cleans up the audio stream when playback fails', async () => {
  const audioInstances = installAudioMock(() =>
    jest.fn(() => Promise.reject(new Error('playback blocked'))),
  )

  await playTimerAudioCue('/low_beep.mp3')

  expect(audioInstances).toHaveLength(1)
  expect(audioInstances[0].play).toHaveBeenCalledTimes(1)
  expect(audioInstances[0].pause).toHaveBeenCalledTimes(1)
  expect(audioInstances[0].removeAttribute).toHaveBeenCalledWith('src')
  expect(audioInstances[0].load).toHaveBeenCalledTimes(1)
})

test('creates and removes a separate stream for each repeated cue', async () => {
  jest.useFakeTimers()
  const audioInstances = installAudioMock()

  const cuePromise = playTimerAudioCue('/high_beep.mp3', {
    repeatCount: 2,
    repeatDelayMs: 500,
  })

  expect(audioInstances).toHaveLength(1)
  expect(audioInstances[0].play).toHaveBeenCalledTimes(1)

  audioInstances[0].emit('ended')
  await Promise.resolve()

  expect(audioInstances[0].removeAttribute).toHaveBeenCalledWith('src')
  expect(audioInstances).toHaveLength(1)

  jest.advanceTimersByTime(499)
  await Promise.resolve()

  expect(audioInstances).toHaveLength(1)

  jest.advanceTimersByTime(1)
  await Promise.resolve()

  expect(audioInstances).toHaveLength(2)
  expect(audioInstances[1].src).toBe('/high_beep.mp3')
  expect(audioInstances[1].play).toHaveBeenCalledTimes(1)

  audioInstances[1].emit('ended')
  await cuePromise

  expect(audioInstances[1].removeAttribute).toHaveBeenCalledWith('src')
  expect(audioInstances[1].load).toHaveBeenCalledTimes(1)
})

test('does not create audio when no source is provided', async () => {
  const audioInstances = installAudioMock()

  await playTimerAudioCue(null)

  expect(audioInstances).toHaveLength(0)
})
