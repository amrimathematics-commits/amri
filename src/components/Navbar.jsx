import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/research', label: 'Research' },
  { to: '/programs', label: 'Programs' },
  { to: '/events', label: 'Events' },
  { to: '/membership', label: 'Membership' },
  { to: '/innovation', label: 'Innovation' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-18 py-4">
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="AMRI logo" className="w-11 h-11 object-contain" />
            <span className="font-display font-semibold text-lg tracking-tight text-ink hidden sm:inline">
              AMRI
            </span>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-1 font-mono font-bold text-sm uppercase tracking-wider">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gold text-ink-soft'
                      : 'text-ink hover:bg-gold/30'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`block w-6 h-0.5 bg-ink transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-6 h-0.5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-ink transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-ink/10 px-6 py-4 flex flex-col gap-1 font-mono text-sm uppercase tracking-wider bg-paper">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `py-2 ${isActive ? 'text-gold' : 'text-ink hover:text-ink-soft'}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}