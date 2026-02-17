import { Navigate, Route, Routes } from 'react-router-dom'
import { CompetitorsCreatePage } from './pages/competitors/CompetitorsCreatePage'
import { CompetitorsDeletePage } from './pages/competitors/CompetitorsDeletePage'
import { CompetitorsDetailsPage } from './pages/competitors/CompetitorsDetailsPage'
import { CompetitorsEditPage } from './pages/competitors/CompetitorsEditPage'
import { CompetitorsIndexPage } from './pages/competitors/CompetitorsIndexPage'
import { EventsIndexPage } from './pages/EventsIndexPage'
import { HomePage } from './pages/HomePage'
import { MatchHistoryErrorPage } from './pages/MatchHistoryErrorPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/competitors" element={<CompetitorsIndexPage />} />
      <Route path="/competitors/create" element={<CompetitorsCreatePage />} />
      <Route path="/competitors/:id/edit" element={<CompetitorsEditPage />} />
      <Route path="/competitors/:id/details" element={<CompetitorsDetailsPage />} />
      <Route path="/competitors/:id/delete" element={<CompetitorsDeletePage />} />
      <Route path="/events" element={<EventsIndexPage />} />
      <Route path="/match-history-error" element={<MatchHistoryErrorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
