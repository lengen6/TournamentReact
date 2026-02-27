const {
  computeStandaloneTimerTick,
  isClockEmpty,
} = require('../test-dist/pages/standaloneTimer.js')

const makeClock = (minutes, seconds) => ({ minutes, seconds })

test('ends the timer at zero when repeat is disabled', () => {
  const tick = computeStandaloneTimerTick(makeClock(0, 1), {
    phase: 'round',
    isRepeatEnabled: false,
    roundDuration: makeClock(5, 0),
    restDuration: makeClock(1, 0),
  })

  expect(tick.nextClock).toEqual(makeClock(0, 0))
  expect(tick.nextPhase).toBe('round')
  expect(tick.shouldKeepRunning).toBe(false)
  expect(tick.playEndGong).toBe(true)
  expect(tick.playStartGong).toBe(false)
})

test('transitions from round to rest at zero when repeat is enabled', () => {
  const tick = computeStandaloneTimerTick(makeClock(0, 1), {
    phase: 'round',
    isRepeatEnabled: true,
    roundDuration: makeClock(4, 30),
    restDuration: makeClock(1, 15),
  })

  expect(tick.nextClock).toEqual(makeClock(1, 15))
  expect(tick.nextPhase).toBe('rest')
  expect(tick.shouldKeepRunning).toBe(true)
  expect(tick.playEndGong).toBe(true)
  expect(tick.playStartGong).toBe(false)
})

test('skips rest and starts next round when rest duration is zero', () => {
  const tick = computeStandaloneTimerTick(makeClock(0, 1), {
    phase: 'round',
    isRepeatEnabled: true,
    roundDuration: makeClock(3, 0),
    restDuration: makeClock(0, 0),
  })

  expect(tick.nextClock).toEqual(makeClock(3, 0))
  expect(tick.nextPhase).toBe('round')
  expect(tick.shouldKeepRunning).toBe(true)
  expect(tick.playEndGong).toBe(true)
  expect(tick.playStartGong).toBe(true)
})

test('starts a new round when rest expires', () => {
  const tick = computeStandaloneTimerTick(makeClock(0, 1), {
    phase: 'rest',
    isRepeatEnabled: true,
    roundDuration: makeClock(6, 0),
    restDuration: makeClock(1, 0),
  })

  expect(tick.nextClock).toEqual(makeClock(6, 0))
  expect(tick.nextPhase).toBe('round')
  expect(tick.shouldKeepRunning).toBe(true)
  expect(tick.playEndGong).toBe(false)
  expect(tick.playStartGong).toBe(true)
})

test('stops after rest expires when round duration is zero', () => {
  const tick = computeStandaloneTimerTick(makeClock(0, 1), {
    phase: 'rest',
    isRepeatEnabled: true,
    roundDuration: makeClock(0, 0),
    restDuration: makeClock(0, 30),
  })

  expect(tick.nextClock).toEqual(makeClock(0, 0))
  expect(tick.nextPhase).toBe('rest')
  expect(tick.shouldKeepRunning).toBe(false)
  expect(tick.playStartGong).toBe(false)
})

test('emits thirty-second warning only in round phase', () => {
  const roundTick = computeStandaloneTimerTick(makeClock(0, 31), {
    phase: 'round',
    isRepeatEnabled: true,
    roundDuration: makeClock(5, 0),
    restDuration: makeClock(1, 0),
  })
  const restTick = computeStandaloneTimerTick(makeClock(0, 31), {
    phase: 'rest',
    isRepeatEnabled: true,
    roundDuration: makeClock(5, 0),
    restDuration: makeClock(1, 0),
  })

  expect(roundTick.playHighBeep).toBe(true)
  expect(restTick.playHighBeep).toBe(false)
})

test('treats 0:00 as a stopped clock', () => {
  const clock = makeClock(0, 0)
  const tick = computeStandaloneTimerTick(clock, {
    phase: 'round',
    isRepeatEnabled: true,
    roundDuration: makeClock(5, 0),
    restDuration: makeClock(1, 0),
  })

  expect(isClockEmpty(clock)).toBe(true)
  expect(tick.nextClock).toBe(clock)
  expect(tick.shouldKeepRunning).toBe(false)
  expect(tick.playEndGong).toBe(false)
  expect(tick.playStartGong).toBe(false)
})
