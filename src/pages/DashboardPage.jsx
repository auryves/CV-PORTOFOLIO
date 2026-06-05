import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, ArrowRight, BookOpen, ClipboardList, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { CarteEntree } from '../components/cours/CarteEntree'
import { CarteDevoir } from '../components/devoirs/CarteDevoir'

function StatCard({ icon: Icon, label, value, gradient, iconBg }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 text-white" style={{ background: gradient }}>
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/08" />
      <div className="relative z-10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
          <Icon size={18} className="text-white" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs mt-0.5 opacity-80 font-medium">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user, isProf } = useAuth()
  const { entrees, devoirs } = useData()
  const navigate = useNavigate()
  const today = new Date()
  const dateLabel = format(today, "EEEE d MMMM", { locale: fr })
  const devoirsAFaire = devoirs.filter(d => d.statut === 'a_faire')
  const devoirsFaits = devoirs.filter(d => d.statut === 'fait')
  const recentEntrees = entrees.slice(0, 3)
  const urgentDevoirs = devoirsAFaire.slice(0, 2)

  return (
    <div className="px-4 pt-4 pb-4 space-y-5">

      {/* ── Welcome banner ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #0E1B4D 0%, #1D4ED8 60%, #3B82F6 100%)' }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/08 blur-xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider capitalize mb-1">{dateLabel}</p>
            <h1 className="text-xl font-bold text-white">
              Bonjour, {user?.nom?.split(' ').slice(-1)[0]} 👋
            </h1>
            <p className="text-blue-200/80 text-sm mt-0.5">{user?.classe}</p>
          </div>
          <div className="bg-white/15 border border-white/25 rounded-xl px-2.5 py-1.5 backdrop-blur-sm">
            <p className="text-white text-xs font-bold capitalize">
              {user?.role === 'professeur' ? '👨‍🏫 Prof.' : '📋 Délégué'}
            </p>
          </div>
        </div>

        {isProf && (
          <button onClick={() => navigate('/cours/nouveau')}
            className="relative z-10 mt-4 flex items-center gap-2 bg-white text-blue-700 text-sm font-bold
            px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors duration-200"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
            <Plus size={16} />
            Nouveau cours du jour
          </button>
        )}
      </div>

      {/* ── Stats grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={BookOpen} label="Cours enregistrés" value={entrees.length}
          gradient="linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)" iconBg="bg-white/20" />
        <StatCard icon={Clock} label="Devoirs à faire" value={devoirsAFaire.length}
          gradient="linear-gradient(135deg, #92400E 0%, #F59E0B 100%)" iconBg="bg-white/20" />
        <StatCard icon={CheckCircle} label="Devoirs accomplis" value={devoirsFaits.length}
          gradient="linear-gradient(135deg, #065F46 0%, #10B981 100%)" iconBg="bg-white/20" />
        <StatCard icon={TrendingUp} label="Taux de complétion" value={devoirs.length ? `${Math.round(devoirsFaits.length/devoirs.length*100)}%` : '—'}
          gradient="linear-gradient(135deg, #1E293B 0%, #475569 100%)" iconBg="bg-white/20" />
      </div>

      {/* ── Devoirs urgents ─────────────────────────── */}
      {urgentDevoirs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Devoirs en attente
            </h2>
            <button onClick={() => navigate('/devoirs')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Voir tout <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {urgentDevoirs.map(d => <CarteDevoir key={d.id} devoir={d} />)}
          </div>
        </section>
      )}

      {/* ── Derniers cours ──────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">Derniers cours</h2>
          <button onClick={() => navigate('/cours')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            Voir tout <ArrowRight size={12} />
          </button>
        </div>
        {recentEntrees.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-card">
            <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-400">Aucun cours encore</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntrees.map(e => <CarteEntree key={e.id} entree={e} />)}
          </div>
        )}
      </section>
    </div>
  )
}
