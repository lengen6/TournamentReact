import { Link, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import {
  maximumEventCompetitors,
  useTournamentStore,
  type EventMode,
} from '../../store/useTournamentStore'

export function CompetitorsIndexPage() {
  const competitors = useTournamentStore((state) => state.competitors)
  const elimination = useTournamentStore((state) => state.elimination)
  const eventMode = useTournamentStore((state) => state.eventMode)
  const setElimination = useTournamentStore((state) => state.setElimination)
  const setEventMode = useTournamentStore((state) => state.setEventMode)
  const beginEvent = useTournamentStore((state) => state.beginEvent)
  const navigate = useNavigate()
  const participantCountIsValid =
    competitors.length >= 2 && competitors.length <= maximumEventCompetitors

  const handleStartEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    beginEvent(elimination, eventMode)
    navigate(`/events?elimination=${elimination}&mode=${eventMode}`)
  }

  return (
    <main className="container py-4 page-competitors-index">
      <h1 className="text-center">Create Your Roster</h1>

      <p className="text-center">
        {competitors.length < maximumEventCompetitors ? (
          <Link to="/competitors/create">Add Competitor</Link>
        ) : (
          <span className="text-muted">
            Maximum roster size is {maximumEventCompetitors} competitors.
          </span>
        )}
      </p>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Byes</th>
              <th>Place</th>
              <th>Bracket</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {competitors.length > 0 ? (
              competitors.map((item) => (
                <tr key={item.competitorId}>
                  <td>{item.firstName}</td>
                  <td>{item.lastName}</td>
                  <td>{item.wins}</td>
                  <td>{item.losses}</td>
                  <td>{item.byes}</td>
                  <td>{item.place}</td>
                  <td>{item.bracket}</td>
                  <td className="text-nowrap">
                    <Link to={`/competitors/${item.competitorId}/edit`}>Edit</Link> |{' '}
                    <Link to={`/competitors/${item.competitorId}/details`}>Details</Link> |{' '}
                    <Link to={`/competitors/${item.competitorId}/delete`}>Delete</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  No competitors added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="container">
        <div className="row">
          <div className="col d-flex justify-content-center">
            <form onSubmit={handleStartEvent} className="text-center">
              <label htmlFor="eventMode" className="form-label">
                Event Style
              </label>
              <select
                id="eventMode"
                className="form-select text-center"
                value={eventMode}
                onChange={(event) => setEventMode(event.target.value as EventMode)}
              >
                <option value="elimination">Elimination</option>
                <option value="round_robin">Round Robin</option>
              </select>
              {eventMode === 'elimination' ? (
                <>
                  <br />
                  <label htmlFor="elimination" className="form-label">
                    No. of Eliminations
                  </label>
                  <select
                    id="elimination"
                    className="form-select text-center"
                    value={elimination}
                    onChange={(event) => setElimination(Number(event.target.value))}
                  >
                    <option value={1}>-- 1 --</option>
                    <option value={2}>-- 2 --</option>
                  </select>
                </>
              ) : null}
              <p className="small text-muted mt-3 mb-0">
                Events support 2 to {maximumEventCompetitors} competitors.
              </p>
              <br />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!participantCountIsValid}
              >
                Click to Start Event
              </button>
              {!participantCountIsValid ? (
                <p className="small text-danger mt-2 mb-0">
                  Add at least 2 competitors and keep the roster at {maximumEventCompetitors} or fewer.
                </p>
              ) : null}
              <p className="mt-3 mb-0">
                <Link to="/standalone-match">Or open standalone match controls</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
