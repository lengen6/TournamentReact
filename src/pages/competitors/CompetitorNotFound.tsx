import { Link } from 'react-router-dom'

export function CompetitorNotFound() {
  return (
    <main className="container py-4">
      <h1>Competitor Not Found</h1>
      <p className="mb-3">
        The competitor you are trying to view does not exist in the current roster.
      </p>
      <Link to="/competitors">Back to List</Link>
    </main>
  )
}
