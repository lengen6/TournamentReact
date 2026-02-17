import { Link } from 'react-router-dom'

export function MatchHistoryErrorPage() {
  return (
    <main className="container py-4">
      <h1>You must clear match results before deleting a competitor</h1>
      <h3 className="mt-4">
        <Link to="/events/results">Click here to redirect to results</Link>
      </h3>
    </main>
  )
}
