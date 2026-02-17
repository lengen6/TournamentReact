import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTournamentStore } from '../store/useTournamentStore'

type ClockState = {
  minutes: number
  seconds: number
}

const initialClock: ClockState = { minutes: 5, seconds: 0 }

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

        if (nextClock.seconds % 30 === 0 && !(nextClock.minutes === 0 && nextClock.seconds === 0)) {
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
    <main className="container py-4">
      <div className="row">
        <div className="col match-outline text-center py-2">
          <h2 className="float-md-start mb-2 mb-md-0">
            {redCompetitor.bracket}&apos;s Bracket
          </h2>
          <h2 className="float-md-end mb-0">
            Round: {activeMatch.round} Match: {activeMatch.matchNumber}
          </h2>
        </div>
      </div>

      <div className="row align-items-center mt-4">
        <div className="col match-outline text-center">
          <h3 className="my-2">Minutes</h3>
        </div>
        <div className="col match-outline text-center">
          <h3 className="my-2">Seconds</h3>
        </div>
      </div>
      <div className="row align-items-center">
        <div className="col match-outline text-center">
          <h1 className="my-2">
            <input
              id="minute"
              type="number"
              max={60}
              min={0}
              value={clock.minutes}
              className="form-control text-center"
              onChange={(event) =>
                setClock((previousClock) => ({
                  ...previousClock,
                  minutes: clampTimeValue(Number(event.target.value)),
                }))
              }
            />
          </h1>
        </div>
        <div className="col match-outline text-center">
          <h1 className="my-2">
            <input
              id="second"
              type="number"
              max={60}
              min={0}
              value={clock.seconds}
              className="form-control text-center"
              onChange={(event) =>
                setClock((previousClock) => ({
                  ...previousClock,
                  seconds: clampTimeValue(Number(event.target.value)),
                }))
              }
            />
          </h1>
        </div>
      </div>

      <div className="row align-items-center match-controls">
        <div className="col match-outline text-center">
          <button
            id="start"
            type="button"
            className="btn btn-outline-primary my-2"
            onClick={handleTimerStart}
            disabled={hasStarted}
          >
            Start
          </button>
        </div>
        <div className="col match-outline text-center">
          <button
            id="reset"
            type="button"
            className="btn btn-outline-secondary my-2"
            onClick={handleTimerReset}
          >
            Reset
          </button>
        </div>
        <div className="col match-outline text-center">
          <button
            id="pause"
            type="button"
            className="btn btn-outline-warning my-2"
            onClick={handleTimerPause}
          >
            Pause
          </button>
        </div>
        <div className="col match-outline text-center">
          <button
            id="play"
            type="button"
            className="btn btn-outline-success my-2"
            onClick={handleTimerResume}
          >
            Resume
          </button>
        </div>
      </div>

      <div className="row align-items-center mt-4">
        <div className="col match-outline text-center match-red">
          <h1 className="my-3">
            {redCompetitor.firstName} {redCompetitor.lastName}
          </h1>
        </div>
        <div className="col match-outline text-center match-blue">
          <h1 className="my-3">
            {blueCompetitor.firstName} {blueCompetitor.lastName}
          </h1>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="col match-outline text-center">
          <button
            type="button"
            className="btn btn-outline-danger my-2"
            onClick={() => setRedScore((score) => score + 1)}
          >
            + Red
          </button>
        </div>
        <div className="col match-outline text-center">
          <button
            type="button"
            className="btn btn-outline-danger my-2"
            onClick={() => setRedScore((score) => Math.max(0, score - 1))}
          >
            - Red
          </button>
        </div>
        <div className="col match-outline text-center">
          <button
            type="button"
            className="btn btn-outline-primary my-2"
            onClick={() => setBlueScore((score) => score + 1)}
          >
            + Blue
          </button>
        </div>
        <div className="col match-outline text-center">
          <button
            type="button"
            className="btn btn-outline-primary my-2"
            onClick={() => setBlueScore((score) => Math.max(0, score - 1))}
          >
            - Blue
          </button>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="col match-outline text-center">
          <h2 className="my-2">{redScore}</h2>
        </div>
        <div className="col match-outline text-center">
          <h2 className="my-2">{blueScore}</h2>
        </div>
      </div>

      <div className="row mt-4 g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">
                {redCompetitor.firstName} {redCompetitor.lastName} Wins
              </h3>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleMatchSubmit(true, 'Submission')}
                >
                  Sub
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleMatchSubmit(true, 'Opponent Disqualification')}
                >
                  DQ
                </button>
                <button
                  type="button"
                  className="btn btn-danger points"
                  disabled={!redPointsEnabled}
                  onClick={() => handleMatchSubmit(true, 'Points')}
                >
                  Points
                </button>
                <button
                  type="button"
                  className="btn btn-danger decision"
                  disabled={!decisionEnabled}
                  onClick={() => handleMatchSubmit(true, 'Decision')}
                >
                  Decision
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">
                {blueCompetitor.firstName} {blueCompetitor.lastName} Wins
              </h3>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleMatchSubmit(false, 'Submission')}
                >
                  Sub
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleMatchSubmit(false, 'Opponent Disqualification')}
                >
                  DQ
                </button>
                <button
                  type="button"
                  className="btn btn-primary points"
                  disabled={!bluePointsEnabled}
                  onClick={() => handleMatchSubmit(false, 'Points')}
                >
                  Points
                </button>
                <button
                  type="button"
                  className="btn btn-primary decision"
                  disabled={!decisionEnabled}
                  onClick={() => handleMatchSubmit(false, 'Decision')}
                >
                  Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio id="start-gong" className="sound" ref={startGongRef}>
        <source src="/start_gong.mp3" />
      </audio>
      <audio id="high-beep" className="sound" ref={highBeepRef}>
        <source src="/high_beep.mp3" />
      </audio>
      <audio id="end-gong" className="sound" ref={endGongRef}>
        <source src="/end_gong.mp3" />
      </audio>
      <audio id="low-beep" className="sound" ref={lowBeepRef}>
        <source src="/low_beep.mp3" />
      </audio>
    </main>
  )
}
