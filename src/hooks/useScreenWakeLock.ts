import { useEffect, useRef } from 'react'

type WakeLockSentinelLike = {
  released: boolean
  release: () => Promise<void>
}

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>
  }
}

const supportsWakeLock = (value: Navigator): value is NavigatorWithWakeLock =>
  'wakeLock' in value && typeof (value as NavigatorWithWakeLock).wakeLock?.request === 'function'

export const useScreenWakeLock = (isEnabled: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    if (!isEnabled || !supportsWakeLock(navigator)) {
      return undefined
    }

    let isCancelled = false

    const releaseWakeLock = async () => {
      const wakeLock = wakeLockRef.current
      if (!wakeLock) {
        return
      }

      wakeLockRef.current = null

      try {
        await wakeLock.release()
      } catch {
        // Ignore release failures.
      }
    }

    const requestWakeLock = async () => {
      if (document.visibilityState !== 'visible') {
        return
      }

      if (wakeLockRef.current?.released) {
        wakeLockRef.current = null
      }

      if (wakeLockRef.current) {
        return
      }

      try {
        const wakeLock = await navigator.wakeLock.request('screen')
        if (isCancelled) {
          await wakeLock.release()
          return
        }

        wakeLockRef.current = wakeLock
      } catch {
        // Ignore unsupported or denied wake lock requests.
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock()
      } else {
        void releaseWakeLock()
      }
    }

    void requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isCancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void releaseWakeLock()
    }
  }, [isEnabled])
}
