import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, BookOpen } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { CarteEntree } from '../components/cours/CarteEntree'
import { Select } from '../components/ui/Input'

export function CoursPage() {
  const { entrees, matieres } = useData()
  const { isProf } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtreMat, setFiltreMat] = useState('')
  const [filtreMois, setFiltreMois] = useState('')

  const moisDispo = useMemo(() => {
    const set = new Set(entrees.map(e => e.date.slice(0, 7)))
    return Array.from(set).sort().reverse()
  }, [entrees])

  const filtered = useMemo(() => entrees
    .filter(e =>
      (!search || e.contenu.toLowerCase().includes(search.toLowerCase())) &&
      (!filtreMat || e.matiere_id === filtreMat) &&
      (!filtreMois || e.date.startsWith(filtreMois))
    )
    .sort((a, b) => b.date.localeCompare(a.date)),
  [entrees, search, filtreMat, filtreMois])

  const hasFilters = search || filtreMat || filtreMois

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Cahier de cours</h1>
        {isProf && (
          <button onClick={() => navigate('/cours/nouveau')}
            className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', boxShadow: '0 4px 12px rgba(37,99,235,.35)' }}>
            <Plus size={16} /> Nouveau
          </button>
        )}
      </div>

      {/* ── Search bar ──────────────────────────────── */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Rechercher dans les cours..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-medium
          text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={filtreMat} onChange={e => setFiltreMat(e.target.value)}>
          <option value="">Toutes les matières</option>
          {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </Select>
        <Select value={filtreMois} onChange={e => setFiltreMois(e.target.value)}>
          <option value="">Tous les mois</option>
          {moisDispo.map(m => <option key={m} value={m}>{m}</option>)}
        </Select>
      </div>

      {hasFilters && (
        <button onClick={() => { setSearch(''); setFiltreMat(''); setFiltreMois('') }}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
          ✕ Effacer les filtres
        </button>
      )}

      {/* ── Count ───────────────────────────────────── */}
      <p className="text-xs font-semibold text-slate-500">
        {filtered.length} cours{hasFilters ? ' (filtré)' : ''}
      </p>

      {/* ── List ────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-14 text-center shadow-card">
          <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-400">Aucun cours trouvé</p>
          {isProf && (
            <button onClick={() => navigate('/cours/nouveau')}
              className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
              + Ajouter le premier cours
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => <CarteEntree key={e.id} entree={e} />)}
        </div>
      )}
    </div>
  )
}
