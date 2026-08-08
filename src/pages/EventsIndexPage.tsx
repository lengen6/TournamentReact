import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTournamentStore } from '../store/useTournamentStore'

export function EventsIndexPage() {
  const [searchParams] = useSearchParams()
  const eliminationFromQuery = searchParams.get('elimination')
  const modeFromQuery = searchParams.get('mode')
  const setElimination = useTournamentStore((state) => state.setElimination)
  const setEventMode = useTournamentStore((state) => state.setEventMode)
  const advanceEvent = useTournamentStore((state) => state.advanceEvent)
  const navigate = useNavigate()
  const didProcessNavigation = useRef(false)

  useEffect(() => {
    if (didProcessNavigation.current) {
      return
    }
    didProcessNavigation.current = true

    if (eliminationFromQuery === '1' || eliminationFromQuery === '2') {
      setElimination(Number(eliminationFromQuery))
    }

    if (modeFromQuery === 'elimination' || modeFromQuery === 'round_robin') {
      setEventMode(modeFromQuery)
    }

    const eventState = advanceEvent()
    if (eventState.status === 'match_ready') {
      navigate('/events/match', { replace: true })
      return
    }

    if (eventState.status === 'results') {
      navigate('/events/results', { replace: true })
      return
    }

    if (eventState.status === 'competitor_count_error') {
      navigate('/competitor-count-error', { replace: true })
      return
    }

    navigate('/', { replace: true })
  }, [advanceEvent, eliminationFromQuery, modeFromQuery, navigate, setElimination, setEventMode])

  return (
    <main className="container py-4">
      <h1>Preparing Event...</h1>
      <p className="mb-0">Building your next matchup.</p>
    </main>
  )
}
