export type ClockState = {
  minutes: number
  seconds: number
}

export type TimerPhase = 'round' | 'rest'

type TimerTickConfig = {
  phase: TimerPhase
  isRepeatEnabled: boolean
  roundDuration: ClockState
  restDuration: ClockState
}

type TimerTickOutcome = {
  nextClock: ClockState
  nextPhase: TimerPhase
  shouldKeepRunning: boolean
  playHighBeep: boolean
  playEndGong: boolean
  playStartGong: boolean
}

const decrementClock = (clock: ClockState): ClockState =>
  clock.seconds > 0
    ? { minutes: clock.minutes, seconds: clock.seconds - 1 }
    : { minutes: Math.max(0, clock.minutes - 1), seconds: 59 }

export const isClockEmpty = (clock: ClockState): boolean =>
  clock.minutes === 0 && clock.seconds === 0

export const computeStandaloneTimerTick = (
  previousClock: ClockState,
  config: TimerTickConfig,
): TimerTickOutcome => {
  if (isClockEmpty(previousClock)) {
    return {
      nextClock: previousClock,
      nextPhase: config.phase,
      shouldKeepRunning: false,
      playHighBeep: false,
      playEndGong: false,
      playStartGong: false,
    }
  }

  const nextClock = decrementClock(previousClock)
  const playHighBeep =
    config.phase === 'round' && nextClock.minutes === 0 && nextClock.seconds === 30

  if (!isClockEmpty(nextClock)) {
    return {
      nextClock,
      nextPhase: config.phase,
      shouldKeepRunning: true,
      playHighBeep,
      playEndGong: false,
      playStartGong: false,
    }
  }

  if (config.phase === 'round') {
    if (!config.isRepeatEnabled) {
      return {
        nextClock,
        nextPhase: 'round',
        shouldKeepRunning: false,
        playHighBeep,
        playEndGong: true,
        playStartGong: false,
      }
    }

    if (!isClockEmpty(config.restDuration)) {
      return {
        nextClock: { ...config.restDuration },
        nextPhase: 'rest',
        shouldKeepRunning: true,
        playHighBeep,
        playEndGong: true,
        playStartGong: false,
      }
    }

    if (!isClockEmpty(config.roundDuration)) {
      return {
        nextClock: { ...config.roundDuration },
        nextPhase: 'round',
        shouldKeepRunning: true,
        playHighBeep,
        playEndGong: true,
        playStartGong: true,
      }
    }

    return {
      nextClock,
      nextPhase: 'round',
      shouldKeepRunning: false,
      playHighBeep,
      playEndGong: true,
      playStartGong: false,
    }
  }

  if (!isClockEmpty(config.roundDuration)) {
    return {
      nextClock: { ...config.roundDuration },
      nextPhase: 'round',
      shouldKeepRunning: true,
      playHighBeep: false,
      playEndGong: false,
      playStartGong: true,
    }
  }

  return {
    nextClock,
    nextPhase: 'rest',
    shouldKeepRunning: false,
    playHighBeep: false,
    playEndGong: false,
    playStartGong: false,
  }
}
