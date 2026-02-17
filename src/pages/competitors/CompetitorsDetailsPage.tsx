import { Link, useParams } from 'react-router-dom'
import { useTournamentStore } from '../../store/useTournamentStore'
import { CompetitorNotFound } from './CompetitorNotFound'
import { parseCompetitorId } from './competitorRoute'

export function CompetitorsDetailsPage() {
  const routeParams = useParams()
  const competitorId = parseCompetitorId(routeParams.id)
  const competitor = useTournamentStore((state) =>
    competitorId
      ? state.competitors.find((item) => item.competitorId === competitorId)
      : undefined,
  )

  if (!competitorId || !competitor) {
    return <CompetitorNotFound />
  }

  return (
    <main className="container py-4">
      <h1>Details</h1>

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
      </div>
      <div>
        <Link to={`/competitors/${competitor.competitorId}/edit`}>Edit</Link> |{' '}
        <Link to="/competitors">Back to List</Link>
      </div>
    </main>
  )
}
