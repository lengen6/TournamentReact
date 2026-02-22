import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTournamentStore } from '../store/useTournamentStore'

type ClockState = {
  minutes: number
  seconds: number
}

const initialClock: ClockState = { minutes: 5, seconds: 0 }
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

export function EventsMatchPage() {
  const competitors = useTournamentStore((state) => state.competitors)
  const activeMatch = useTournamentStore((state) => state.activeMatch)
  const completeActiveMatch = useTournamentStore((state) => state.completeActiveMatch)
  const navigate = useNavigate()

  const startGongRef = useRef<HTMLAudioElement>(null)
  const highBeepRef = useRef<HTMLAudioElement>(null)
  const endGongRef = useRef<HTMLAudioElement>(null)
  const lowBeepRef = useRef<HTMLAudioElement>(null)

  const [clock, setClock] = useState<ClockState>(initialClock)
  const [startClock, setStartClock] = useState<ClockState | null>(null)
  const [redScore, setRedScore] = useState(0)
  const [blueScore, setBlueScore] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const redCompetitor = competitors.find(
    (competitor) => competitor.competitorId === activeMatch?.redCompetitorId,
  )
  const blueCompetitor = competitors.find(
    (competitor) => competitor.competitorId === activeMatch?.blueCompetitorId,
  )

  useEffect(() => {
    if (!isRunning || isPaused) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setClock((previousClock) => {
        if (previousClock.minutes === 0 && previousClock.seconds === 0) {
          return previousClock
        }

        const nextClock =
          previousClock.seconds > 0
            ? { minutes: previousClock.minutes, seconds: previousClock.seconds - 1 }
            : { minutes: Math.max(0, previousClock.minutes - 1), seconds: 59 }

        if (nextClock.minutes === 0 && nextClock.seconds === 30) {
          playAudio(highBeepRef.current)
          window.setTimeout(() => playAudio(highBeepRef.current), 500)
        }

        if (nextClock.minutes === 0 && nextClock.seconds === 0) {
          playAudio(endGongRef.current)
          setIsRunning(false)
          setIsPaused(false)
        }

        return nextClock
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isPaused, isRunning])

  if (!activeMatch || !redCompetitor || !blueCompetitor) {
    return (
      <main className="container py-4">
        <h1>No Active Match</h1>
        <p className="mb-3">
          The event engine has no current pairing. Return to the event page to continue.
        </p>
        <Link to="/events">Back to Event Flow</Link>
      </main>
    )
  }

  const timeExpired = clock.minutes === 0 && clock.seconds === 0
  const redPointsEnabled = timeExpired && redScore > blueScore
  const bluePointsEnabled = timeExpired && blueScore > redScore
  const decisionEnabled = timeExpired && redScore === blueScore
  const bracketLabel =
    activeMatch.round === 1 &&
    activeMatch.bracket === 'Winner' &&
    redCompetitor.losses === 0 &&
    blueCompetitor.losses === 0
      ? 'Initial'
      : activeMatch.bracket
  const redCompetitorName = [redCompetitor.firstName, redCompetitor.lastName]
    .filter(Boolean)
    .join(' ')
  const blueCompetitorName = [blueCompetitor.firstName, blueCompetitor.lastName]
    .filter(Boolean)
    .join(' ')
  const matchStatus = timeExpired
    ? 'Time Expired'
    : isRunning && !isPaused
      ? 'Live'
      : isPaused
        ? 'Paused'
        : hasStarted
          ? 'Awaiting Result'
          : 'Ready'
  const matchStatusClassName = timeExpired
    ? 'active-match-state-expired'
    : isRunning && !isPaused
      ? 'active-match-state-live'
      : isPaused
        ? 'active-match-state-paused'
        : 'active-match-state-ready'

  const handleTimerStart = () => {
    if (hasStarted) {
      return
    }

    setStartClock(clock)
    setHasStarted(true)
    setIsPaused(false)
    setIsRunning(true)
    playAudio(startGongRef.current)
  }

  const handleTimerReset = () => {
    setClock({ minutes: 0, seconds: 0 })
    setStartClock(null)
    setRedScore(0)
    setBlueScore(0)
    setHasStarted(false)
    setIsRunning(false)
    setIsPaused(false)
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

  const handleMatchSubmit = (redWins: boolean, victoryMethod: string) => {
    const matchStart = startClock ?? clock
    completeActiveMatch({
      redWins,
      victoryMethod,
      redScore,
      blueScore,
      startMinutes: matchStart.minutes,
      startSeconds: matchStart.seconds,
      endMinutes: clock.minutes,
      endSeconds: clock.seconds,
    })

    navigate('/events')
  }

  return (
    <main className="container py-4 active-match-page">
      <section className="active-match-header">
        <p className="active-match-kicker mb-0">Live Match Control</p>
        <div className="active-match-meta">
          <span className="active-match-pill">{bracketLabel} Bracket</span>
          <span className="active-match-pill">Round {activeMatch.round}</span>
          <span className="active-match-pill">Match {activeMatch.matchNumber}</span>
        </div>
        <p className={`active-match-state mb-0 ${matchStatusClassName}`}>
          {matchStatus}
        </p>
      </section>

      <section className="active-match-board">
        <article className="active-match-fighter active-match-fighter-red">
          <p className="active-match-corner-label mb-2">Red Corner</p>
          <h2 className="active-match-fighter-name">{redCompetitorName}</h2>
          <div className="active-match-score-controls">
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label={`Decrease ${redCompetitorName} score`}
              onClick={() => setRedScore((score) => Math.max(0, score - 1))}
            >
              -
            </button>
            <p className="active-match-score-value mb-0">{redScore}</p>
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label={`Increase ${redCompetitorName} score`}
              onClick={() => setRedScore((score) => score + 1)}
            >
              +
            </button>
          </div>
        </article>

        <article className="active-match-clock-card">
          <p className="active-match-clock-label mb-2">Round Clock</p>
          <div className="active-match-time-inputs">
            <label htmlFor="minute" className="active-match-time-field-group">
              <span>Minutes</span>
              <input
                id="minute"
                type="number"
                max={60}
                min={0}
                value={clock.minutes}
                className="form-control text-center active-match-time-field"
                onChange={(event) =>
                  setClock((previousClock) => ({
                    ...previousClock,
                    minutes: clampTimeValue(Number(event.target.value)),
                  }))
                }
              />
            </label>
            <span className="active-match-time-separator">:</span>
            <label htmlFor="second" className="active-match-time-field-group">
              <span>Seconds</span>
              <input
                id="second"
                type="number"
                max={60}
                min={0}
                value={clock.seconds}
                className="form-control text-center active-match-time-field"
                onChange={(event) =>
                  setClock((previousClock) => ({
                    ...previousClock,
                    seconds: clampTimeValue(Number(event.target.value)),
                  }))
                }
              />
            </label>
          </div>

          <div className="active-match-timer-controls match-controls">
            <button
              id="start"
              type="button"
              className="btn btn-outline-primary"
              onClick={handleTimerStart}
              disabled={hasStarted}
            >
              Start
            </button>
            <button
              id="reset"
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleTimerReset}
            >
              Reset
            </button>
            <button
              id="pause"
              type="button"
              className="btn btn-outline-warning"
              onClick={handleTimerPause}
            >
              Pause
            </button>
            <button
              id="play"
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
          <h2 className="active-match-fighter-name">{blueCompetitorName}</h2>
          <div className="active-match-score-controls">
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label={`Decrease ${blueCompetitorName} score`}
              onClick={() => setBlueScore((score) => Math.max(0, score - 1))}
            >
              -
            </button>
            <p className="active-match-score-value mb-0">{blueScore}</p>
            <button
              type="button"
              className="btn btn-outline-light active-match-score-btn"
              aria-label={`Increase ${blueCompetitorName} score`}
              onClick={() => setBlueScore((score) => score + 1)}
            >
              +
            </button>
          </div>
        </article>
      </section>

      <section className="active-match-results">
        <article className="active-match-result-card active-match-result-card-red">
          <h3 className="active-match-result-title">{redCompetitorName} Wins</h3>
          <div className="active-match-result-buttons">
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleMatchSubmit(true, 'Submission')}
            >
              Submission
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleMatchSubmit(true, 'Opponent Disqualification')}
            >
              DQ
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!redPointsEnabled}
              onClick={() => handleMatchSubmit(true, 'Points')}
            >
              Points
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!decisionEnabled}
              onClick={() => handleMatchSubmit(true, 'Decision')}
            >
              Decision
            </button>
          </div>
        </article>

        <article className="active-match-result-card active-match-result-card-blue">
          <h3 className="active-match-result-title">{blueCompetitorName} Wins</h3>
          <div className="active-match-result-buttons">
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleMatchSubmit(false, 'Submission')}
            >
              Submission
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              onClick={() => handleMatchSubmit(false, 'Opponent Disqualification')}
            >
              DQ
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!bluePointsEnabled}
              onClick={() => handleMatchSubmit(false, 'Points')}
            >
              Points
            </button>
            <button
              type="button"
              className="btn active-match-result-btn"
              disabled={!decisionEnabled}
              onClick={() => handleMatchSubmit(false, 'Decision')}
            >
              Decision
            </button>
          </div>
        </article>
      </section>

      <audio id="start-gong" className="sound" ref={startGongRef}>
        <source src={startGongUrl} />
      </audio>
      <audio id="high-beep" className="sound" ref={highBeepRef}>
        <source src={highBeepUrl} />
      </audio>
      <audio id="end-gong" className="sound" ref={endGongRef}>
        <source src={endGongUrl} />
      </audio>
      <audio id="low-beep" className="sound" ref={lowBeepRef}>
        <source src={lowBeepUrl} />
      </audio>
    </main>
  )
}
