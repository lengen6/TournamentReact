import { Link } from 'react-router-dom'

export function CompetitorCountErrorPage() {
  return (
    <main className="container py-4">
      <h1>
        Events need 2 to 8 competitors. Please update your roster and try again.
      </h1>
      <h3 className="mt-4">
        <Link to="/competitors">Click here to go back to setup</Link>
      </h3>
    </main>
  )
}
