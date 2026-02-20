import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const buildNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `nav-link px-3 site-nav-link${isActive ? ' site-nav-link-active' : ''}`

export function SiteLayout() {
  const { pathname } = useLocation()
  const [openPathname, setOpenPathname] = useState<string | null>(null)
  const isMenuOpen = openPathname === pathname

  const toggleMenu = () => {
    setOpenPathname((currentValue) => (currentValue === pathname ? null : pathname))
  }

  const closeMenu = () => {
    setOpenPathname(null)
  }

  return (
    <div className="site-shell">
      <header className="site-header border-bottom">
        <nav className="navbar navbar-expand-lg navbar-light py-3">
          <div className="container d-flex flex-wrap align-items-center gap-3">
            <Link className="navbar-brand mb-0 fw-semibold" to="/" onClick={closeMenu}>
              Tie Ren Tournament
            </Link>
            <button
              type="button"
              className="navbar-toggler ms-auto"
              aria-label="Toggle navigation"
              aria-controls="site-navbar-navigation"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div
              id="site-navbar-navigation"
              className={`collapse navbar-collapse site-nav-collapse${isMenuOpen ? ' show' : ''}`}
            >
              <ul className="navbar-nav site-nav-list ms-auto mt-3 mt-lg-0 flex-column flex-lg-row">
                <li className="nav-item">
                  <NavLink to="/" end className={buildNavLinkClassName} onClick={closeMenu}>
                    Home
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
          <span>Tie Ren Tournament</span>
          <small className="text-muted">Built for live event operations.</small>
        </div>
      </footer>
    </div>
  )
}
