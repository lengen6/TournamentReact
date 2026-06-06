import { useCallback, useEffect } from 'react'

type AudioSessionType =
  | 'auto'
  | 'playback'
  | 'transient'
  | 'transient-solo'
  | 'ambient'
  | 'play-and-record'

type NavigatorWithAudioSession = Navigator & {
  audioSession?: {
    type: AudioSessionType
  }
}

export type TimerAudioCueOptions = {
  repeatCount?: number
  repeatDelayMs?: number
  failsafeMs?: number
}

const timerCueSessionType: AudioSessionType = 'transient-solo'
const restingSessionType: AudioSessionType = 'ambient'
const defaultRepeatCount = 1
const defaultRepeatDelayMs = 0
const defaultFailsafeMs = 6000
let activeTimerCueCount = 0

const supportsAudioSession = (
  value: Navigator,
): value is NavigatorWithAudioSession =>
  'audioSession' in value && Boolean((value as NavigatorWithAudioSession).audioSession)

const getAudioSession = () => {
  if (typeof navigator === 'undefined' || !supportsAudioSession(navigator)) {
    return null
  }

  return navigator.audioSession ?? null
}

const setAudioSessionType = (type: AudioSessionType) => {
  const audioSession = getAudioSession()

  if (!audioSession) {
    return
  }

  try {
    if (audioSession.type !== type) {
      audioSession.type = type
    }
  } catch {
    // Ignore unsupported or denied session updates.
  }
}

const requestTimerAudioFocus = () => {
  if (activeTimerCueCount === 0) {
    setAudioSessionType(timerCueSessionType)
  }

  activeTimerCueCount += 1
}

const releaseTimerAudioFocus = () => {
  activeTimerCueCount = Math.max(0, activeTimerCueCount - 1)

  if (activeTimerCueCount === 0) {
    setAudioSessionType(restingSessionType)
  }
}

const ensureRestingTimerAudioFocus = () => {
  if (activeTimerCueCount === 0) {
    setAudioSessionType(restingSessionType)
  }
}

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

const isAudioElement = (
  audioElement: HTMLAudioElement | null,
): audioElement is HTMLAudioElement => Boolean(audioElement)

const unlockAudioElement = (audioElement: HTMLAudioElement) => {
  let isSettled = false
  const originalMuted = audioElement.muted

  const settle = () => {
    if (isSettled) {
      return
    }

    isSettled = true
    clearTimeout(unlockTimer)

    try {
      audioElement.pause()
    } catch {
      // Ignore cleanup failures from browser-specific media state.
    }

    try {
      audioElement.currentTime = 0
    } catch {
      // Some browsers may reject currentTime changes before media is ready.
    }

    audioElement.muted = originalMuted
  }

  const unlockTimer = setTimeout(settle, 250)

  try {
    audioElement.muted = true
    audioElement.currentTime = 0
  } catch {
    // Keep going: the play call is the important part for iOS unlocking.
  }

  try {
    const playback = audioElement.play()
    void playback.then(settle).catch(settle)
  } catch {
    settle()
  }
}

export const unlockTimerAudioElements = (
  audioElements: Array<HTMLAudioElement | null>,
) => {
  const uniqueAudioElements = new Set(audioElements.filter(isAudioElement))

  uniqueAudioElements.forEach((audioElement) => {
    unlockAudioElement(audioElement)
  })
}

const playAudioElementOnce = (
  audioElement: HTMLAudioElement,
  failsafeMs: number,
) =>
  new Promise<void>((resolve) => {
    let isSettled = false

    const settle = () => {
      if (isSettled) {
        return
      }

      isSettled = true
      audioElement.removeEventListener('ended', settle)
      audioElement.removeEventListener('error', settle)
      clearTimeout(failsafeTimer)

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
  audioElement: HTMLAudioElement | null,
  options: TimerAudioCueOptions = {},
) => {
  if (!audioElement) {
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

  requestTimerAudioFocus()

  try {
    for (let cueIndex = 0; cueIndex < repeatCount; cueIndex += 1) {
      await playAudioElementOnce(audioElement, failsafeMs)

      if (cueIndex < repeatCount - 1 && repeatDelayMs > 0) {
        await wait(repeatDelayMs)
      }
    }
  } finally {
    releaseTimerAudioFocus()
  }
}

export const useTimerAudioCue = () => {
  const playCue = useCallback(
    (audioElement: HTMLAudioElement | null, options?: TimerAudioCueOptions) =>
      playTimerAudioCue(audioElement, options),
    [],
  )

  useEffect(() => {
    ensureRestingTimerAudioFocus()
  }, [])

  return playCue
}
