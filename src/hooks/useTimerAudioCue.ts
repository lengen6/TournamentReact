import { useCallback } from 'react'

export type TimerAudioCueOptions = {
  repeatCount?: number
  repeatDelayMs?: number
  failsafeMs?: number
}

const defaultRepeatCount = 1
const defaultRepeatDelayMs = 0
const defaultFailsafeMs = 6000

const normalizePositiveInteger = (value: number | undefined, fallback: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(1, Math.floor(value))
}

const normalizeNonNegativeInteger = (
  value: number | undefined,
  fallback: number,
) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, Math.floor(value))
}

const wait = (delayMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs)
  })

const disposeAudioElement = (audioElement: HTMLAudioElement) => {
  try {
    audioElement.pause()
  } catch {
    // Ignore cleanup failures from browser-specific media state.
  }

  try {
    audioElement.removeAttribute('src')
    audioElement.load()
  } catch {
    // Best effort: clearing src + load nudges browsers to release the stream.
  }
}

const playAudioSourceOnce = (sourceUrl: string, failsafeMs: number) =>
  new Promise<void>((resolve) => {
    const audioElement = new Audio(sourceUrl)
    let isSettled = false

    audioElement.preload = 'auto'
    audioElement.setAttribute('playsinline', '')

    const settle = () => {
      if (isSettled) {
        return
      }

      isSettled = true
      audioElement.removeEventListener('ended', settle)
      audioElement.removeEventListener('error', settle)
      clearTimeout(failsafeTimer)
      disposeAudioElement(audioElement)

      resolve()
    }

    const failsafeTimer = setTimeout(settle, failsafeMs)

    audioElement.addEventListener('ended', settle)
    audioElement.addEventListener('error', settle)

    try {
      audioElement.currentTime = 0
    } catch {
      // Some browsers may reject currentTime changes before media is ready.
    }

    try {
      const playback = audioElement.play()
      void playback.catch(settle)
    } catch {
      settle()
    }
  })

export const playTimerAudioCue = async (
  sourceUrl: string | null,
  options: TimerAudioCueOptions = {},
) => {
  if (!sourceUrl) {
    return
  }

  const repeatCount = normalizePositiveInteger(
    options.repeatCount,
    defaultRepeatCount,
  )
  const repeatDelayMs = normalizeNonNegativeInteger(
    options.repeatDelayMs,
    defaultRepeatDelayMs,
  )
  const failsafeMs = normalizeNonNegativeInteger(
    options.failsafeMs,
    defaultFailsafeMs,
  )

  for (let cueIndex = 0; cueIndex < repeatCount; cueIndex += 1) {
    await playAudioSourceOnce(sourceUrl, failsafeMs)

    if (cueIndex < repeatCount - 1 && repeatDelayMs > 0) {
      await wait(repeatDelayMs)
    }
  }
}

export const useTimerAudioCue = () =>
  useCallback(
    (sourceUrl: string | null, options?: TimerAudioCueOptions) =>
      playTimerAudioCue(sourceUrl, options),
    [],
  )
