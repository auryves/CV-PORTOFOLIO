import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, BookOpen, Lock, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingRole, setLoadingRole] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/tableau-de-bord')
    } catch (err) {
      setError(err.message || 'Identifiants incorrects')
    } finally { setLoading(false) }
  }

  async function loginQuick(role) {
    const creds = {
      professeur: { email: 'prof@demo.ci', password: 'demo1234' },
      delegue: { email: 'delegue@demo.ci', password: 'demo1234' },
    }[role]
    setLoadingRole(role)
    try {
      await login(creds.email, creds.password)
      navigate('/tableau-de-bord')
    } catch (e) { setError(e.message) }
    finally { setLoadingRole(null) }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (branding) ─────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(150deg, #0E1B4D 0%, #1D4ED8 55%, #2563EB 100%)' }}>
        {/* Decorative blobs */}
        <div className="shape-blob w-80 h-80 bg-blue-400" style={{ top: '-10%', left: '-10%' }} />
        <div className="shape-blob w-64 h-64 bg-indigo-400" style={{ bottom: '5%', right: '-5%', animationDelay: '3s' }} />
        <div className="shape-blob w-40 h-40 bg-sky-300" style={{ top: '45%', left: '30%', animationDelay: '6s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CahierNum</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-3 tracking-wider uppercase">Bienvenue sur</p>
            <h1 className="text-white text-4xl font-bold leading-tight mb-4">
              Cahier de Texte<br />
              <span className="text-blue-200">Numérique</span>
            </h1>
            <p className="text-blue-200/80 text-base leading-relaxed max-w-sm">
              Gérez facilement vos cours, devoirs et supports pédagogiques. Conçu pour les classes de BTS en Côte d'Ivoire.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '6', l: 'Matières' },
              { n: '∞', l: 'Cours' },
              { n: '2', l: 'Rôles' },
            ].map(({ n, l }) => (
              <div key={l} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{n}</p>
                <p className="text-xs text-blue-200 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-300/60 text-xs">
          🇨🇮 BTS SIO · Abidjan, Côte d'Ivoire
        </p>
      </div>

      {/* ── Right panel (form) ────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)' }}>
              <BookOpen size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Cahier de Texte Numérique</h1>
            <p className="text-slate-500 text-sm">BTS SIO 2024/2025</p>
          </div>

          <div className="bg-white rounded-3xl shadow-card p-8 border border-slate-100">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
              <p className="text-slate-500 text-sm mt-1">Accédez à votre espace de cours</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Adresse e-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" required autoComplete="email"
                    placeholder="votre@email.ci"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="input-premium pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="input-premium pl-10 pr-11"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-sm text-red-700">
                  <span className="text-red-500 flex-shrink-0">⚠</span>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', boxShadow: '0 4px 16px rgba(37,99,235,.40)' }}>
                {loading ? 'Connexion...' : 'Se connecter →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Démo rapide</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Demo cards */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => loginQuick('professeur')} disabled={!!loadingRole}
                className="group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:border-blue-400 hover:shadow-lg disabled:opacity-50"
                style={{ borderColor: '#BFDBFE', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}>
                <div className="text-2xl mb-2">👨‍🏫</div>
                <p className="text-sm font-bold text-blue-900">Professeur</p>
                <p className="text-xs text-blue-600 mt-0.5">M. Konan Yao</p>
                {loadingRole === 'professeur' && (
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>

              <button onClick={() => loginQuick('delegue')} disabled={!!loadingRole}
                className="group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:border-emerald-400 hover:shadow-lg disabled:opacity-50"
                style={{ borderColor: '#A7F3D0', background: 'linear-gradient(135deg, #F0FDF4, #D1FAE5)' }}>
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm font-bold text-emerald-900">Délégué(e)</p>
                <p className="text-xs text-emerald-600 mt-0.5">Aya Kouamé</p>
                {loadingRole === 'delegue' && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-5">
              Aucun compte requis · Données de démo pré-chargées
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
