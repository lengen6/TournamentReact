import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTournamentStore } from '../../store/useTournamentStore'
import { CompetitorNotFound } from './CompetitorNotFound'
import { CompetitorForm, type CompetitorFormValues } from './CompetitorForm'
import { parseCompetitorId } from './competitorRoute'

export function CompetitorsEditPage() {
  const routeParams = useParams()
  const competitorId = parseCompetitorId(routeParams.id)
  const competitor = useTournamentStore((state) =>
    competitorId
      ? state.competitors.find((item) => item.competitorId === competitorId)
      : undefined,
  )
  const updateCompetitor = useTournamentStore((state) => state.updateCompetitor)
  const navigate = useNavigate()

  if (!competitorId || !competitor) {
    return <CompetitorNotFound />
  }

  const handleEditCompetitor = (values: CompetitorFormValues) => {
    updateCompetitor(competitorId, values)
    navigate('/competitors')
  }

  return (
    <main className="container py-4">
      <h1>Edit</h1>
      <h4>Competitor</h4>
      <hr />
      <div className="row">
        <div className="col-md-4">
          <CompetitorForm
            submitLabel="Save"
            initialValues={{
              firstName: competitor.firstName,
              lastName: competitor.lastName,
            }}
            onSubmit={handleEditCompetitor}
          />
        </div>
      </div>
      <div className="mt-3">
        <Link to="/competitors">Back to List</Link>
      </div>
    </main>
  )
}
