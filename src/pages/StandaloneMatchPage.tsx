import { useEffect, useRef, useState } from 'react'
import {
  type ClockState,
  computeStandaloneTimerTick,
  isClockEmpty,
  type TimerPhase,
} from './standaloneTimer'

const initialClock: ClockState = { minutes: 5, seconds: 0 }
const initialRestClock: ClockState = { minutes: 1, seconds: 0 }
const startGongUrl = `${import.meta.env.BASE_URL}start_gong.mp3`
const highBeepUrl = `${import.meta.env.BASE_URL}high_beep.mp3`
const endGongUrl = `${import.meta.env.BASE_URL}end_gong.mp3`
const lowBeepUrl = `${import.meta.env.BASE_URL}low_beep.mp3`

const playAudio = (audioElement: HTMLAudioElement | null) => {
  if (!audioElement) {
    return
  }

  audioElement.currentTime = 0
  void audioElement.play().catch(() => {
    // Ignore autoplay errors.
  })
}

const clampTimeValue = (value: number): number =>
  Math.max(0, Math.min(60, Math.floor(value)))

const formatTime = (clock: ClockState): string =>
  `${clock.minutes}:${String(clock.seconds).padStart(2, '0')}`

export function StandaloneMatchPage() {
  const startGongRef = useRef<HTMLAudioElement>(null)
  const highBeepRef = useRef<HTMLAudioElement>(null)
  const endGongRef = useRef<HTMLAudioElement>(null)
  const lowBeepRef = useRef<HTMLAudioElement>(null)

  const [clock, setClock] = useState<ClockState>(initialClock)
  const [matchStartClock, setMatchStartClock] = useState<ClockState | null>(null)
  const [roundDuration, setRoundDuration] = useState<ClockState>(initialClock)
  const [restDuration, setRestDuration] = useState<ClockState>(initialRestClock)
  const [redScore, setRedScore] = useState(0)
  const [blueScore, setBlueScore] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false)
  const [phase, setPhase] = useState<TimerPhase>('round')
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isRunning || isPaused) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setClock((previousClock) => {
        const tick = computeStandaloneTimerTick(previousClock, {
          phase,
          isRepeatEnabled,
          roundDuration,
          restDuration,
        })

        if (tick.playHighBeep) {
          playAudio(highBeepRef.current)
          window.setTimeout(() => playAudio(highBeepRef.current), 500)
        }

        if (tick.playEndGong) {
          playAudio(endGongRef.current)
        }

        if (tick.playStartGong) {
          playAudio(startGongRef.current)
        }

        if (!tick.shouldKeepRunning) {
          setIsRunning(false)
          setIsPaused(false)
        }

        if (tick.nextPhase !== phase) {
          setPhase(tick.nextPhase)
        }

        return tick.nextClock
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isPaused, isRepeatEnabled, isRunning, phase, restDuration, roundDuration])

  const timeExpired = !isRepeatEnabled && isClockEmpty(clock)
  const redPointsEnabled = timeExpired && redScore > blueScore
  const bluePointsEnabled = timeExpired && blueScore > redScore
  const decisionEnabled = timeExpired && redScore === blueScore

  const matchStatus = timeExpired
    ? 'Time Expired'
    : isRunning && !isPaused
      ? phase === 'round'
        ? 'Live'
        : 'Rest'
      : isPaused
        ? phase === 'round'
          ? 'Paused'
          : 'Rest Paused'
        : hasStarted
          ? isRepeatEnabled
            ? 'Stopped'
            : 'Awaiting Result'
          : 'Ready'
  const matchStatusClassName = timeExpired
    ? 'active-match-state-expired'
    : isRunning && !isPaused
      ? phase === 'round'
        ? 'active-match-state-live'
        : 'active-match-state-rest'
      : isPaused
        ? 'active-match-state-paused'
        : 'active-match-state-ready'

  const handleRoundMinutesChange = (value: number) => {
    const minutes = clampTimeValue(value)
    setRoundDuration((previousClock) => ({ ...previousClock, minutes }))

    if (phase === 'round' || !hasStarted) {
      setClock((previousClock) => ({ ...previousClock, minutes }))
    }
  }

  const handleRoundSecondsChange = (value: number) => {
    const seconds = clampTimeValue(value)
    setRoundDuration((previousClock) => ({ ...previousClock, seconds }))

    if (phase === 'round' || !hasStarted) {
      setClock((previousClock) => ({ ...previousClock, seconds }))
    }
  }

  const handleRestMinutesChange = (value: number) => {
    const minutes = clampTimeValue(value)
    setRestDuration((previousClock) => ({ ...previousClock, minutes }))

    if (phase === 'rest') {
      setClock((previousClock) => ({ ...previousClock, minutes }))
    }
  }

  const handleRestSecondsChange = (value: number) => {
    const seconds = clampTimeValue(value)
    setRestDuration((previousClock) => ({ ...previousClock, seconds }))

    if (phase === 'rest') {
      setClock((previousClock) => ({ ...previousClock, seconds }))
    }
  }

  const handleTimerStart = () => {
    if (hasStarted || isClockEmpty(clock)) {
      return
    }

    setRoundDuration(clock)
    setMatchStartClock(clock)
    setPhase('round')
    setHasStarted(true)
    setIsPaused(false)
    setIsRunning(true)
    playAudio(startGongRef.current)
  }

  const handleTimerReset = () => {
    setClock({ minutes: 0, seconds: 0 })
    setMatchStartClock(null)
    setRoundDuration({ minutes: 0, seconds: 0 })
    setPhase('round')
    setRedScore(0)
    setBlueScore(0)
    setHasStarted(false)
    setIsRunning(false)
    setIsPaused(false)
    setResultMessage(null)
  }

  const handleTimerPause = () => {
    if (!isRunning || isPaused) {
      return
    }

    playAudio(lowBeepRef.current)
    window.setTimeout(() => playAudio(lowBeepRef.current), 500)
    setIsPaused(true)
  }

  const handleTimerResume = () => {
    if (!isRunning || !isPaused) {
      return
    }

    playAudio(lowBeepRef.current)
    setIsPaused(false)
  }

  const handleResultSubmit = (redWins: boolean, victoryMethod: string) => {
    const winnerLabel = redWins ? 'Red Corner' : 'Blue Corner'
    const matchStart = matchStartClock ?? clock
    setResultMessage(
      `${winnerLabel} wins by ${victoryMethod}. Start ${formatTime(matchStart)} End ${formatTime(clock)}`,
    )
  }

  return (
    <main className="container py-4 active-match-page">
      <section className="active-match-header">
        <p className="active-match-kicker mb-0">Standalone Match Control</p>
        <div className="active-match-meta">
          <span className="active-match-pill">Practice / Open Mat</span>
          <span className="active-match-pill">No Bracket Tracking</span>
        </div>
        <p className={`active-match-state mb-0 ${matchStatusClassName}`}>
          {matchStatus}
        </p>
      </section>

      <section className="active-match-board">
        <article className="active-match-fighter active-match-fighter-red">
          <p className="active-match-corner-label mb-2">Red Corner</p>
          <h2 className="active-match-fighter-name">Red Corner</h2>
          <div className="active-match-score-controls">
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label="Decrease red corner score"
              onClick={() => setRedScore((score) => Math.max(0, score - 1))}
            >
              -
            </button>
            <p className="active-match-score-value mb-0">{redScore}</p>
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label="Increase red corner score"
              onClick={() => setRedScore((score) => score + 1)}
            >
              +
            </button>
          </div>
        </article>

        <article className="active-match-clock-card">
          <p className="active-match-clock-label mb-2">
            {phase === 'round' ? 'Round Clock' : 'Rest Clock'}
          </p>
          <div className="active-match-time-inputs">
            <label htmlFor="standalone-minute" className="active-match-time-field-group">
              <span>Minutes</span>
              <input
                id="standalone-minute"
                type="number"
                max={60}
                min={0}
                value={clock.minutes}
                className="form-control text-center active-match-time-field"
                onChange={(event) =>
                  phase === 'round'
                    ? handleRoundMinutesChange(Number(event.target.value))
                    : handleRestMinutesChange(Number(event.target.value))
                }
              />
            </label>
            <span className="active-match-time-separator">:</span>
            <label htmlFor="standalone-second" className="active-match-time-field-group">
              <span>Seconds</span>
              <input
                id="standalone-second"
                type="number"
                max={60}
                min={0}
                value={clock.seconds}
                className="form-control text-center active-match-time-field"
                onChange={(event) =>
                  phase === 'round'
                    ? handleRoundSecondsChange(Number(event.target.value))
                    : handleRestSecondsChange(Number(event.target.value))
                }
              />
            </label>
          </div>

          <div className="form-check active-match-repeat-toggle">
            <input
              id="standalone-repeat"
              type="checkbox"
              className="form-check-input"
              checked={isRepeatEnabled}
              disabled={hasStarted}
              onChange={(event) => setIsRepeatEnabled(event.target.checked)}
            />
            <label className="form-check-label" htmlFor="standalone-repeat">
              Repeat rounds automatically
            </label>
          </div>

          {isRepeatEnabled ? (
            <div className="active-match-rest-settings">
              <p className="active-match-clock-label mb-2">Rest Between Rounds</p>
              <div className="active-match-time-inputs">
                <label htmlFor="standalone-rest-minute" className="active-match-time-field-group">
                  <span>Minutes</span>
                  <input
                    id="standalone-rest-minute"
                    type="number"
                    max={60}
                    min={0}
                    value={restDuration.minutes}
                    className="form-control text-center active-match-time-field"
                    onChange={(event) =>
                      handleRestMinutesChange(Number(event.target.value))
                    }
                  />
                </label>
                <span className="active-match-time-separator">:</span>
                <label htmlFor="standalone-rest-second" className="active-match-time-field-group">
                  <span>Seconds</span>
                  <input
                    id="standalone-rest-second"
                    type="number"
                    max={60}
                    min={0}
                    value={restDuration.seconds}
                    className="form-control text-center active-match-time-field"
                    onChange={(event) =>
                      handleRestSecondsChange(Number(event.target.value))
                    }
                  />
                </label>
              </div>
            </div>
          ) : null}

          <div className="active-match-timer-controls match-controls">
            <button
              id="standalone-start"
              type="button"
              className="btn btn-outline-primary"
              onClick={handleTimerStart}
              disabled={hasStarted || isClockEmpty(clock)}
            >
              Start
            </button>
            <button
              id="standalone-reset"
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleTimerReset}
            >
              Reset
            </button>
            <button
              id="standalone-pause"
              type="button"
              className="btn btn-outline-warning"
              onClick={handleTimerPause}
            >
              Pause
            </button>
            <button
              id="standalone-resume"
              type="button"
              className="btn btn-outline-success"
              onClick={handleTimerResume}
            >
              Resume
            </button>
          </div>
        </article>

        <article className="active-match-fighter active-match-fighter-blue">
          <p className="active-match-corner-label mb-2">Blue Corner</p>
          <h2 className="active-match-fighter-name">Blue Corner</h2>
          <div className="active-match-score-controls">
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label="Decrease blue corner score"
              onClick={() => setBlueScore((score) => Math.max(0, score - 1))}
            >
              -
            </button>
            <p className="active-match-score-value mb-0">{blueScore}</p>
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label="Increase blue corner score"
              onClick={() => setBlueScore((score) => score + 1)}
            >
              +
            </button>
          </div>
        </article>
      </section>

      <section className="active-match-results">
        <article className="active-match-result-card active-match-result-card-red">
          <h3 className="active-match-result-title">Red Corner Wins</h3>
          <div className="active-match-result-buttons">
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleResultSubmit(true, 'Submission')}
            >
              Submission
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleResultSubmit(true, 'Opponent Disqualification')}
            >
              DQ
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!redPointsEnabled}
              onClick={() => handleResultSubmit(true, 'Points')}
            >
              Points
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!decisionEnabled}
              onClick={() => handleResultSubmit(true, 'Decision')}
            >
              Decision
            </button>
          </div>
        </article>

        <article className="active-match-result-card active-match-result-card-blue">
          <h3 className="active-match-result-title">Blue Corner Wins</h3>
          <div className="active-match-result-buttons">
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleResultSubmit(false, 'Submission')}
            >
              Submission
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleResultSubmit(false, 'Opponent Disqualification')}
            >
              DQ
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!bluePointsEnabled}
              onClick={() => handleResultSubmit(false, 'Points')}
            >
              Points
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!decisionEnabled}
              onClick={() => handleResultSubmit(false, 'Decision')}
            >
              Decision
            </button>
          </div>
        </article>
      </section>

      {resultMessage ? (
        <p className="standalone-match-announcement mb-0" role="status">
          {resultMessage}
        </p>
      ) : null}

      <audio id="standalone-start-gong" className="sound" ref={startGongRef}>
        <source src={startGongUrl} />
      </audio>
      <audio id="standalone-high-beep" className="sound" ref={highBeepRef}>
        <source src={highBeepUrl} />
      </audio>
      <audio id="standalone-end-gong" className="sound" ref={endGongRef}>
        <source src={endGongUrl} />
      </audio>
      <audio id="standalone-low-beep" className="sound" ref={lowBeepRef}>
        <source src={lowBeepUrl} />
      </audio>
    </main>
  )
}
