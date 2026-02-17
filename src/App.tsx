import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/competitors"
        element={
          <main className="container py-5">
            <h1>Competitors Page Coming Soon</h1>
            <p className="mb-0">
              This route is in place for the ongoing migration from Razor Pages.
            </p>
          </main>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
