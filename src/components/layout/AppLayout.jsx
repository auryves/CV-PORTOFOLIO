import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  BookOpen, Calendar, ClipboardList, Upload, LogOut, Home, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'

const navItems = [
  { to: '/tableau-de-bord', label: 'Accueil', icon: Home },
  { to: '/cours', label: 'Cours', icon: BookOpen },
  { to: '/devoirs', label: 'Devoirs', icon: ClipboardList },
  { to: '/calendrier', label: 'Calendrier', icon: Calendar },
]

const profItems = [
  { to: '/upload', label: 'Support', icon: Upload },
]

export function AppLayout() {
  const { user, logout, isProf } = useAuth()
  const { devoirs } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const pendingCount = devoirs.filter((d) => d.statut === 'a_faire').length
  const allNav = isProf ? [...navItems, ...profItems] : navItems

  async function handleLogout() {
    await logout()
    navigate('/connexion')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-blue-200" />
            <span className="font-bold text-base tracking-tight">Cahier Numérique</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-blue-200 font-medium">{user?.nom}</span>
            <span className="hidden sm:block text-xs bg-blue-700 px-2 py-0.5 rounded-full text-blue-100 capitalize">
              {user?.role === 'professeur' ? 'Professeur' : 'Délégué(e)'}
            </span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1 text-sm text-blue-200 hover:text-white transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden bg-blue-900 px-4 pb-3 pt-1 space-y-1">
            <p className="text-xs text-blue-300 pb-2">{user?.nom} · {user?.role === 'professeur' ? 'Professeur' : 'Délégué(e)'}</p>
            {allNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition
                  ${isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white w-full"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 max-w-3xl mx-auto w-full">
        {/* Sidebar (desktop) */}
        <aside className="hidden sm:flex flex-col w-52 py-4 px-2 gap-1 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-slate-200 bg-white">
          {allNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${isActive ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }
            >
              <Icon size={17} />
              {label}
              {label === 'Devoirs' && pendingCount > 0 && (
                <span className="ml-auto bg-amber-400 text-amber-900 text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 sm:pb-4">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex">
        {allNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium gap-0.5 transition relative
              ${isActive ? 'text-blue-700' : 'text-slate-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
                {label === 'Devoirs' && pendingCount > 0 && (
                  <span className="absolute top-1 right-1/4 bg-amber-400 text-amber-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
