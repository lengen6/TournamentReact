import { Link } from 'react-router-dom'

export function CompetitorCountErrorPage() {
  return (
    <main className="container py-4">
      <h1>
        You tried to start an event with less than 2 competitors. Please add
        competitors and try again.
      </h1>
      <h3 className="mt-4">
        <Link to="/competitors">Click here to go back to setup</Link>
      </h3>
    </main>
  )
}
