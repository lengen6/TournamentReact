import { Link } from 'react-router-dom'

export function CompetitorCountErrorPage() {
  return (
    <main className="container py-4">
      <h1>
        Events need at least 2 competitors. Round robin supports up to 6,
        single elimination supports up to 16, and double elimination supports up to 8.
      </h1>
      <h3 className="mt-4">
        <Link to="/competitors">Click here to go back to setup</Link>
      </h3>
    </main>
  )
}
