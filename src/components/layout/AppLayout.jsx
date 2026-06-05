import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, ClipboardList, Upload, LogOut, Home, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'

const navItems = [
  { to: '/tableau-de-bord', label: 'Accueil', icon: Home },
  { to: '/cours', label: 'Cours', icon: BookOpen },
  { to: '/devoirs', label: 'Devoirs', icon: ClipboardList },
  { to: '/calendrier', label: 'Calendrier', icon: Calendar },
]
const profItems = [{ to: '/upload', label: 'Support', icon: Upload }]

export function AppLayout() {
  const { user, logout, isProf } = useAuth()
  const { devoirs } = useData()
  const navigate = useNavigate()
  const [userMenu, setUserMenu] = useState(false)
  const pending = devoirs.filter(d => d.statut === 'a_faire').length
  const allNav = isProf ? [...navItems, ...profItems] : navItems

  async function handleLogout() {
    await logout()
    navigate('/connexion')
  }

  return (
    <div className="min-h-screen" style={{ background: '#F0F4FF' }}>
      {/* ── Top Header ───────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #0E1B4D 0%, #1D4ED8 100%)',
        boxShadow: '0 2px 20px rgba(14,27,77,.25)'
      }} className="sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center border border-white/20">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">CahierNum</span>
              <span className="hidden sm:inline text-blue-300 text-xs ml-2 font-medium">BTS SIO</span>
            </div>
          </div>

          {/* User pill */}
          <div className="relative">
            <button onClick={() => setUserMenu(o => !o)}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20
              rounded-xl px-3 py-1.5 transition-all duration-200">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-blue-900"
                style={{ background: 'linear-gradient(135deg, #93C5FD, #DBEAFE)' }}>
                {user?.nom?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:block text-white text-xs font-semibold max-w-[120px] truncate">
                {user?.nom?.split(' ').slice(-1)[0]}
              </span>
              <span className="text-blue-200 text-xs px-1.5 py-0.5 bg-white/10 rounded-md font-medium capitalize">
                {user?.role === 'professeur' ? 'Prof.' : 'Délég.'}
              </span>
              <ChevronDown size={12} className={`text-blue-200 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
            </button>

            {userMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.nom}</p>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.classe}</p>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors">
                  <LogOut size={14} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Close dropdown on outside click */}
      {userMenu && <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />}

      <div className="max-w-3xl mx-auto flex">
        {/* ── Sidebar (desktop) ──────────────────────── */}
        <aside className="hidden sm:flex flex-col w-56 py-5 px-3 gap-1
          sticky top-14 h-[calc(100vh-3.5rem)] self-start">
          {allNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
              ${isActive
                ? 'text-blue-700 bg-white shadow-card border border-blue-100'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'}`
            }>
              {({ isActive }) => (
                <>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                    ${isActive ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <Icon size={15} className={isActive ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <span>{label}</span>
                  {label === 'Devoirs' && pending > 0 && (
                    <span className="ml-auto text-xs font-bold bg-amber-400 text-amber-900 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {pending}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          <div className="flex-1" />

          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400
            hover:bg-red-50 hover:text-red-600 transition-all duration-150 mt-2">
            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
              <LogOut size={14} className="text-slate-500" />
            </div>
            Déconnexion
          </button>
        </aside>

        {/* ── Main content ───────────────────────────── */}
        <main className="flex-1 min-w-0 pb-24 sm:pb-6 pt-2">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ──────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(226,232,240,0.8)' }}>
        <div className="flex">
          {allNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `nav-item ${isActive ? 'text-blue-700' : 'text-slate-400'} relative`
            }>
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-8 flex items-center justify-center rounded-xl transition-all duration-200
                    ${isActive ? 'bg-blue-600/10' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                  <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  {label === 'Devoirs' && pending > 0 && (
                    <span className="absolute top-1 right-1/4 bg-amber-400 text-amber-900 text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {pending}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
