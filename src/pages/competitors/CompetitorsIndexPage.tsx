import { Link, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import { useTournamentStore } from '../../store/useTournamentStore'

export function CompetitorsIndexPage() {
  const competitors = useTournamentStore((state) => state.competitors)
  const elimination = useTournamentStore((state) => state.elimination)
  const setElimination = useTournamentStore((state) => state.setElimination)
  const navigate = useNavigate()

  const handleStartEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(`/events?elimination=${elimination}`)
  }

  return (
    <main className="container py-4">
      <h1 className="text-center">Create Your Roster</h1>

      <p className="text-center">
        <Link to="/competitors/create">Add Competitor</Link>
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
              <br />
              <button type="submit" className="btn btn-primary">
                Click to Start Event
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
