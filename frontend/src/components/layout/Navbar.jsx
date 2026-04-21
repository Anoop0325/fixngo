
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const roleLinks = {
  user:     [{ to: '/dashboard', label: 'Home' }, { to: '/history', label: 'History' }],
  provider: [{ to: '/provider/dashboard',  label: 'Dashboard' }, { to: '/provider/requests', label: 'Requests' }],
  admin:    [{ to: '/admin',               label: 'Admin Panel' }],
}

export default function Navbar({ unreadCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = (user?.role && roleLinks[user.role]) || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="page-container flex items-center justify-between h-16">

        {}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-base">⚡</span>
          <span className="text-white">fix<span className="text-brand-400">ngo</span></span>
        </Link>

        {}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600/20 text-brand-400' : 'text-slate-400 hover:text-white hover:bg-surface-hover'
                }`
              }>
              {label}
            </NavLink>
          ))}
        </div>

        {}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {}
              <Link to="/notifications" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border cursor-pointer hover:bg-surface-hover transition-colors" onClick={() => navigate('/profile')}>
                <div className="h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.fullName?.[0] ?? user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-slate-300 max-w-[120px] truncate">{user.fullName || user.email}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-900 text-brand-300 font-medium capitalize">{user.role}</span>
              </div>

              <button onClick={handleLogout}
                className="hidden md:inline-flex btn-secondary text-xs px-3 py-1.5">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="btn-secondary text-sm px-4 py-2">Login</Link>
              <Link to="/register" className="btn-primary  text-sm px-4 py-2">Sign Up</Link>
            </div>
          )}

          {}
          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
            aria-label="Toggle menu">
            {menuOpen
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </div>

      {}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card px-4 py-3 space-y-1 animate-slide-up">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600/20 text-brand-400' : 'text-slate-400 hover:text-white'
                }`
              }>
              {label}
            </NavLink>
          ))}
          {user && (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Edit Profile
              </Link>
              <button onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
