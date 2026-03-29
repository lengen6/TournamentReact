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

const supportsAudioSession = (
  value: Navigator,
): value is NavigatorWithAudioSession =>
  'audioSession' in value && Boolean((value as NavigatorWithAudioSession).audioSession)

const setAmbientAudioSession = () => {
  if (!supportsAudioSession(navigator) || !navigator.audioSession) {
    return
  }

  try {
    if (navigator.audioSession.type !== 'ambient') {
      navigator.audioSession.type = 'ambient'
    }
  } catch {
    // Ignore unsupported or denied session updates.
  }
}

export const useAmbientAudioSession = () => {
  const ensureAmbientAudioSession = useCallback(() => {
    setAmbientAudioSession()
  }, [])

  useEffect(() => {
    ensureAmbientAudioSession()
  }, [ensureAmbientAudioSession])

  return ensureAmbientAudioSession
}
