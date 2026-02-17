import { Link, useNavigate } from 'react-router-dom'
import { useTournamentStore } from '../../store/useTournamentStore'
import { CompetitorForm, type CompetitorFormValues } from './CompetitorForm'

export function CompetitorsCreatePage() {
  const addCompetitor = useTournamentStore((state) => state.addCompetitor)
  const navigate = useNavigate()

  const handleCreateCompetitor = (values: CompetitorFormValues) => {
    addCompetitor(values)
    navigate('/competitors')
  }

  return (
    <main className="container py-4">
      <h1>Create</h1>
      <h4>Competitor</h4>
      <hr />
      <div className="row">
        <div className="col-md-4">
          <CompetitorForm submitLabel="Create" onSubmit={handleCreateCompetitor} />
        </div>
      </div>
      <div className="mt-3">
        <Link to="/competitors">Back to List</Link>
      </div>
    </main>
  )
}
