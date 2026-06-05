import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const DEMO_ACCOUNTS = [
  { label: 'Connexion Professeur', email: 'prof@demo.ci', password: 'demo1234', role: 'professeur' },
  { label: 'Connexion Délégué(e)', email: 'delegue@demo.ci', password: 'demo1234', role: 'delegue' },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/tableau-de-bord')
    } catch (err) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  async function loginQuick(account) {
    setError('')
    setLoading(true)
    try {
      await login(account.email, account.password)
      navigate('/tableau-de-bord')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Cahier de Texte</h1>
          <p className="text-blue-200 text-sm mt-1">Numérique — BTS SIO 2024/2025</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Adresse e-mail"
              type="email"
              placeholder="votre@email.ci"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3 font-medium uppercase tracking-wide">
              Comptes de démonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.role}
                  onClick={() => loginQuick(a)}
                  disabled={loading}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 text-sm font-medium transition
                    ${a.role === 'professeur'
                      ? 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                >
                  <span className="text-lg mb-0.5">{a.role === 'professeur' ? '👨‍🏫' : '📋'}</span>
                  <span className="text-xs">{a.role === 'professeur' ? 'Professeur' : 'Délégué(e)'}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Cliquez pour vous connecter directement</p>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          Lycée / BTS · Côte d'Ivoire
        </p>
      </div>
    </div>
  )
}
