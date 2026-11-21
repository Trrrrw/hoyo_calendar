import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { AppHeader } from './components/AppHeader'
import { useGames } from './hooks/useCalendarApi'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { TimelinePage } from './pages/TimelinePage'
import ThemeProvider from './theme/ThemeProvider'

function CalendarApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const timelineSearch = useRef(location.pathname === '/' ? location.search : '')
  const { data: games, loading, error } = useGames()
  const activeView = location.pathname === '/subscribe' ? 'builder' : 'calendar'

  useEffect(() => {
    if (location.pathname === '/') timelineSearch.current = location.search
  }, [location.pathname, location.search])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <AppHeader
        activeView={activeView}
        onViewChange={(view) => {
          navigate(view === 'calendar' ? `/${timelineSearch.current}` : '/subscribe')
        }}
      />

      <main className="relative min-h-0 flex-1">
        <Routes>
          <Route
            path="/"
            element={<TimelinePage games={games} loading={loading} error={error} />}
          />
          <Route
            path="/subscribe"
            element={
              <SubscriptionPage games={games} loading={loading} error={error} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <CalendarApp />
    </ThemeProvider>
  )
}
