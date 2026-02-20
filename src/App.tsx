import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { CompetitorCountErrorPage } from './pages/CompetitorCountErrorPage'
import { EventsHistoryPage } from './pages/EventsHistoryPage'
import { CompetitorsCreatePage } from './pages/competitors/CompetitorsCreatePage'
import { CompetitorsDeletePage } from './pages/competitors/CompetitorsDeletePage'
import { CompetitorsDetailsPage } from './pages/competitors/CompetitorsDetailsPage'
import { CompetitorsEditPage } from './pages/competitors/CompetitorsEditPage'
import { CompetitorsIndexPage } from './pages/competitors/CompetitorsIndexPage'
import { EventsIndexPage } from './pages/EventsIndexPage'
import { EventsMatchPage } from './pages/EventsMatchPage'
import { EventsResultsPage } from './pages/EventsResultsPage'
import { HomePage } from './pages/HomePage'
import { MatchHistoryErrorPage } from './pages/MatchHistoryErrorPage'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="competitors" element={<CompetitorsIndexPage />} />
        <Route path="competitors/create" element={<CompetitorsCreatePage />} />
        <Route path="competitors/:id/edit" element={<CompetitorsEditPage />} />
        <Route path="competitors/:id/details" element={<CompetitorsDetailsPage />} />
        <Route path="competitors/:id/delete" element={<CompetitorsDeletePage />} />
        <Route path="events" element={<EventsIndexPage />} />
        <Route path="events/match" element={<EventsMatchPage />} />
        <Route path="events/results" element={<EventsResultsPage />} />
        <Route path="events/history" element={<EventsHistoryPage />} />
        <Route path="match-history-error" element={<MatchHistoryErrorPage />} />
        <Route path="competitor-count-error" element={<CompetitorCountErrorPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
