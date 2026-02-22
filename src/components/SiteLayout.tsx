import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const buildNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `nav-link px-3 site-nav-link${isActive ? ' site-nav-link-active' : ''}`

type ThemeMode = 'light' | 'dark'
const themeStorageKey = 'openbracket-theme'

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return 'dark'
}

export function SiteLayout() {
  const { pathname } = useLocation()
  const [openPathname, setOpenPathname] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme())
  const isMenuOpen = openPathname === pathname

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  const toggleMenu = () => {
    setOpenPathname((currentValue) => (currentValue === pathname ? null : pathname))
  }

  const closeMenu = () => {
    setOpenPathname(null)
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="site-shell">
      <header className="site-header border-bottom">
        <nav className="navbar navbar-expand-lg navbar-light py-3">
          <div className="container d-flex flex-wrap align-items-center gap-3">
            <button
              type="button"
              className="btn site-theme-toggle"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <Link className="navbar-brand mb-0 fw-semibold" to="/" onClick={closeMenu}>
              OpenBracket
            </Link>
            <div className="site-header-actions d-flex align-items-center gap-2 ms-auto order-lg-3">
              <button
                type="button"
                className="navbar-toggler"
                aria-label="Toggle navigation"
                aria-controls="site-navbar-navigation"
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
              >
                <span className="navbar-toggler-icon" />
              </button>
            </div>
            <div
              id="site-navbar-navigation"
              className={`collapse navbar-collapse site-nav-collapse order-3 order-lg-2${isMenuOpen ? ' show' : ''}`}
            >
              <ul className="navbar-nav site-nav-list mt-3 mt-lg-0 ms-lg-auto flex-column flex-lg-row">
                <li className="nav-item">
                  <NavLink to="/" end className={buildNavLinkClassName} onClick={closeMenu}>
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/about" className={buildNavLinkClassName} onClick={closeMenu}>
                    About
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/competitors"
                    className={buildNavLinkClassName}
                    onClick={closeMenu}
                  >
                    Competitors
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/events" end className={buildNavLinkClassName} onClick={closeMenu}>
                    Event Flow
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/standalone-match"
                    className={buildNavLinkClassName}
                    onClick={closeMenu}
                  >
                    Standalone
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/events/results"
                    className={buildNavLinkClassName}
                    onClick={closeMenu}
                  >
                    Results
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/events/history"
                    className={buildNavLinkClassName}
                    onClick={closeMenu}
                  >
                    Match History
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="site-content">
        <Outlet />
      </div>

      <footer className="site-footer border-top">
        <div className="container py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>OpenBracket</span>
          <small className="text-muted">Built for live event operations.</small>
        </div>
      </footer>
    </div>
  )
}
