import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { CarteEntree } from '../components/cours/CarteEntree'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Card, CardBody } from '../components/ui/Card'
import { BookOpen } from 'lucide-react'

export function CoursPage() {
  const { entrees, matieres } = useData()
  const { isProf } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtreMat, setFiltreMat] = useState('')
  const [filtreMois, setFiltreMois] = useState('')

  const moisDisponibles = useMemo(() => {
    const set = new Set(entrees.map((e) => e.date.slice(0, 7)))
    return Array.from(set).sort().reverse()
  }, [entrees])

  const filtered = useMemo(() => {
    return entrees
      .filter((e) => {
        const matchSearch = !search || e.contenu.toLowerCase().includes(search.toLowerCase())
        const matchMat = !filtreMat || e.matiere_id === filtreMat
        const matchMois = !filtreMois || e.date.startsWith(filtreMois)
        return matchSearch && matchMat && matchMois
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [entrees, search, filtreMat, filtreMois])

  const hasFilters = search || filtreMat || filtreMois

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-slate-800">Cahier de cours</h1>
        {isProf && (
          <Button size="sm" onClick={() => navigate('/cours/nouveau')}>
            <Plus size={15} />
            Nouveau
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher dans les cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filtreMat}
            onChange={(e) => setFiltreMat(e.target.value)}
          >
            <option value="">Toutes les matières</option>
            {matieres.map((m) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </Select>
          <Select
            value={filtreMois}
            onChange={(e) => setFiltreMois(e.target.value)}
          >
            <option value="">Tous les mois</option>
            {moisDisponibles.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFiltreMat(''); setFiltreMois('') }}
            className="text-xs text-blue-600 hover:underline"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Résultats */}
      <p className="text-xs text-slate-500 mb-3">
        {filtered.length} cours{filtered.length > 1 ? '' : ''}
        {hasFilters ? ' (filtré)' : ''}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">Aucun cours trouvé</p>
            {isProf && (
              <Button size="sm" variant="secondary" className="mt-4" onClick={() => navigate('/cours/nouveau')}>
                <Plus size={14} /> Ajouter le premier cours
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        filtered.map((e) => <CarteEntree key={e.id} entree={e} />)
      )}
    </div>
  )
}
