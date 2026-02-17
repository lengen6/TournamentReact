import { Link, useNavigate, useParams } from 'react-router-dom'
import type { FormEvent } from 'react'
import { useTournamentStore } from '../../store/useTournamentStore'
import { CompetitorNotFound } from './CompetitorNotFound'
import { parseCompetitorId } from './competitorRoute'

export function CompetitorsDeletePage() {
  const routeParams = useParams()
  const competitorId = parseCompetitorId(routeParams.id)
  const competitor = useTournamentStore((state) =>
    competitorId
      ? state.competitors.find((item) => item.competitorId === competitorId)
      : undefined,
  )
  const deleteCompetitor = useTournamentStore((state) => state.deleteCompetitor)
  const navigate = useNavigate()

  if (!competitorId || !competitor) {
    return <CompetitorNotFound />
  }

  const handleDeleteCompetitor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const deleteResult = deleteCompetitor(competitorId)
    if (deleteResult === 'has_history') {
      navigate('/match-history-error')
      return
    }

    navigate('/competitors')
  }

  return (
    <main className="container py-4">
      <h1>Delete</h1>
      <h3>Are you sure you want to delete this?</h3>
      <div>
        <h4>Competitor</h4>
        <hr />
        <dl className="row">
          <dt className="col-sm-2">First Name</dt>
          <dd className="col-sm-10">{competitor.firstName}</dd>

          <dt className="col-sm-2">Last Name</dt>
          <dd className="col-sm-10">{competitor.lastName}</dd>

          <dt className="col-sm-2">Wins</dt>
          <dd className="col-sm-10">{competitor.wins}</dd>

          <dt className="col-sm-2">Losses</dt>
          <dd className="col-sm-10">{competitor.losses}</dd>

          <dt className="col-sm-2">Byes</dt>
          <dd className="col-sm-10">{competitor.byes}</dd>

          <dt className="col-sm-2">Place</dt>
          <dd className="col-sm-10">{competitor.place}</dd>
        </dl>

        <form onSubmit={handleDeleteCompetitor}>
          <button type="submit" className="btn btn-danger">
            Delete
          </button>{' '}
          | <Link to="/competitors">Back to List</Link>
        </form>
      </div>
    </main>
  )
}
