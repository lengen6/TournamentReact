import { Link, useSearchParams } from 'react-router-dom'

export function EventsIndexPage() {
  const [searchParams] = useSearchParams()
  const elimination = searchParams.get('elimination') ?? '2'

  return (
    <main className="container py-4">
      <h1>Event Setup In Progress</h1>
      <p className="mb-2">
        Event pages are part of the next migration slice. Selected eliminations:{' '}
        <strong>{elimination}</strong>.
      </p>
      <p className="mb-0">
        <Link to="/competitors">Back to Competitors</Link>
      </p>
    </main>
  )
}
