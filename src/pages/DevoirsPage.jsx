import { useState, useMemo } from 'react'
import { parseISO } from 'date-fns'
import { ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Select } from '../components/ui/Input'
import { CarteDevoir } from '../components/devoirs/CarteDevoir'

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'a_faire', label: 'À faire' },
  { key: 'fait', label: 'Faits' },
]

export function DevoirsPage() {
  const { devoirs, matieres } = useData()
  const [onglet, setOnglet] = useState('all')
  const [filtreMat, setFiltreMat] = useState('')

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const enRetard = devoirs.filter(d => d.statut === 'a_faire' && d.echeance && parseISO(d.echeance) < today).length
  const aFaireCount = devoirs.filter(d => d.statut === 'a_faire').length
  const faitsCount = devoirs.filter(d => d.statut === 'fait').length
  const ratio = devoirs.length ? Math.round(faitsCount / devoirs.length * 100) : 0

  const filtered = useMemo(() => devoirs
    .filter(d => (onglet === 'all' || d.statut === onglet) && (!filtreMat || d.matiere_id === filtreMat))
    .sort((a, b) => {
      if (a.statut !== b.statut) return a.statut === 'a_faire' ? -1 : 1
      if (!a.echeance) return 1; if (!b.echeance) return -1
      return a.echeance.localeCompare(b.echeance)
    }),
  [devoirs, onglet, filtreMat])

  return (
    <div className="px-4 pt-4 pb-4 space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Suivi des devoirs</h1>

      {/* ── Progress card ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, #0E1B4D 0%, #1D4ED8 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Progression globale</p>
              <p className="text-white text-3xl font-bold">{ratio}%</p>
            </div>
            <p className="text-blue-200 text-sm font-medium">{faitsCount}/{devoirs.length} devoirs</p>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${ratio}%` }} />
          </div>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Clock, label: 'À faire', value: aFaireCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { icon: AlertCircle, label: 'En retard', value: enRetard, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
          { icon: CheckCircle, label: 'Faits', value: faitsCount, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-3 text-center`}>
            <Icon size={18} className={`${color} mx-auto mb-1.5`} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <Select value={filtreMat} onChange={e => setFiltreMat(e.target.value)}>
        <option value="">Toutes les matières</option>
        {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
      </Select>

      {/* ── Tabs ────────────────────────────────────── */}
      <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-sm">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setOnglet(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200
              ${onglet === key
                ? 'text-white shadow-button'
                : 'text-slate-500 hover:text-slate-700'}`}
            style={onglet === key ? { background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)' } : {}}>
            {label}
            {key === 'a_faire' && aFaireCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full px-1.5">
                {aFaireCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── List ────────────────────────────────────── */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center shadow-card">
            <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-400">
              {onglet === 'fait' ? 'Aucun devoir accompli' : 'Aucun devoir en cours'}
            </p>
          </div>
        ) : (
          filtered.map(d => <CarteDevoir key={d.id} devoir={d} />)
        )}
      </div>
    </div>
  )
}
