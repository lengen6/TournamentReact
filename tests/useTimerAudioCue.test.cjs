const {
  playTimerAudioCue,
  unlockTimerAudioElements,
} = require('../test-dist/hooks/useTimerAudioCue.js')

const setNavigator = (value) => {
  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value,
  })
}

const createAudioElement = (play = jest.fn(() => Promise.resolve())) => {
  const listeners = new Map()

  return {
    currentTime: 12,
    muted: false,
    pause: jest.fn(),
    play,
    addEventListener: jest.fn((eventName, listener) => {
      listeners.set(eventName, listener)
    }),
    removeEventListener: jest.fn((eventName, listener) => {
      if (listeners.get(eventName) === listener) {
        listeners.delete(eventName)
      }
    }),
    emit: (eventName) => {
      listeners.get(eventName)?.()
    },
  }
}

afterEach(() => {
  jest.useRealTimers()
  delete global.navigator
})

test('plays timer audio when the Audio Session API is unsupported', async () => {
  setNavigator({})
  const audioElement = createAudioElement()

  const cuePromise = playTimerAudioCue(audioElement)

  expect(audioElement.currentTime).toBe(0)
  expect(audioElement.play).toHaveBeenCalledTimes(1)

  audioElement.emit('ended')
  await cuePromise
})

test('uses transient solo focus while supported timer audio is playing', async () => {
  const audioSession = { type: 'ambient' }
  setNavigator({ audioSession })
  const audioElement = createAudioElement()

  const cuePromise = playTimerAudioCue(audioElement)

  expect(audioSession.type).toBe('transient-solo')

  audioElement.emit('ended')
  await cuePromise

  expect(audioSession.type).toBe('ambient')
})

test('releases audio focus when playback fails', async () => {
  const audioSession = { type: 'ambient' }
  setNavigator({ audioSession })
  const audioElement = createAudioElement(
    jest.fn(() => Promise.reject(new Error('playback blocked'))),
  )

  await playTimerAudioCue(audioElement)

  expect(audioElement.play).toHaveBeenCalledTimes(1)
  expect(audioSession.type).toBe('ambient')
})

test('keeps audio focus active until a repeated cue finishes', async () => {
  jest.useFakeTimers()
  const audioSession = { type: 'ambient' }
  setNavigator({ audioSession })
  const audioElement = createAudioElement()

  const cuePromise = playTimerAudioCue(audioElement, {
    repeatCount: 2,
    repeatDelayMs: 500,
  })

  expect(audioSession.type).toBe('transient-solo')
  expect(audioElement.play).toHaveBeenCalledTimes(1)

  audioElement.emit('ended')
  await Promise.resolve()

  expect(audioSession.type).toBe('transient-solo')
  expect(audioElement.play).toHaveBeenCalledTimes(1)

  jest.advanceTimersByTime(499)
  await Promise.resolve()

  expect(audioElement.play).toHaveBeenCalledTimes(1)

  jest.advanceTimersByTime(1)
  await Promise.resolve()

  expect(audioSession.type).toBe('transient-solo')
  expect(audioElement.play).toHaveBeenCalledTimes(2)

  audioElement.emit('ended')
  await cuePromise

  expect(audioSession.type).toBe('ambient')
})

test('keeps audio focus active until overlapping cues finish', async () => {
  const audioSession = { type: 'ambient' }
  setNavigator({ audioSession })
  const firstAudioElement = createAudioElement()
  const secondAudioElement = createAudioElement()

  const firstCuePromise = playTimerAudioCue(firstAudioElement)
  const secondCuePromise = playTimerAudioCue(secondAudioElement)

  expect(audioSession.type).toBe('transient-solo')

  firstAudioElement.emit('ended')
  await firstCuePromise

  expect(audioSession.type).toBe('transient-solo')

  secondAudioElement.emit('ended')
  await secondCuePromise

  expect(audioSession.type).toBe('ambient')
})

test('does not request audio focus when no audio element is provided', async () => {
  const audioSession = { type: 'ambient' }
  setNavigator({ audioSession })

  await playTimerAudioCue(null)

  expect(audioSession.type).toBe('ambient')
})

test('silently primes audio elements for later timer playback', async () => {
  const firstAudioElement = createAudioElement()
  const secondAudioElement = createAudioElement()
  secondAudioElement.muted = true

  unlockTimerAudioElements([firstAudioElement, secondAudioElement, null])

  expect(firstAudioElement.muted).toBe(true)
  expect(secondAudioElement.muted).toBe(true)
  expect(firstAudioElement.currentTime).toBe(0)
  expect(secondAudioElement.currentTime).toBe(0)
  expect(firstAudioElement.play).toHaveBeenCalledTimes(1)
  expect(secondAudioElement.play).toHaveBeenCalledTimes(1)

  await Promise.resolve()

  expect(firstAudioElement.pause).toHaveBeenCalledTimes(1)
  expect(secondAudioElement.pause).toHaveBeenCalledTimes(1)
  expect(firstAudioElement.currentTime).toBe(0)
  expect(secondAudioElement.currentTime).toBe(0)
  expect(firstAudioElement.muted).toBe(false)
  expect(secondAudioElement.muted).toBe(true)
})

test('silently primes each unique audio element only once', async () => {
  const audioElement = createAudioElement()

  unlockTimerAudioElements([audioElement, audioElement, null])

  expect(audioElement.play).toHaveBeenCalledTimes(1)

  await Promise.resolve()
})
