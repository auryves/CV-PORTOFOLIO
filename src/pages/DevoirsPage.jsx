import { useState, useMemo } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Select } from '../components/ui/Input'
import { CarteDevoir } from '../components/devoirs/CarteDevoir'
import { Card, CardBody } from '../components/ui/Card'

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'a_faire', label: 'À faire' },
  { key: 'fait', label: 'Faits' },
]

export function DevoirsPage() {
  const { devoirs, matieres } = useData()
  const [onglet, setOnglet] = useState('all')
  const [filtreMat, setFiltreMat] = useState('')

  const filtered = useMemo(() => {
    return devoirs
      .filter((d) => {
        const matchTab = onglet === 'all' || d.statut === onglet
        const matchMat = !filtreMat || d.matiere_id === filtreMat
        return matchTab && matchMat
      })
      .sort((a, b) => {
        if (a.statut !== b.statut) return a.statut === 'a_faire' ? -1 : 1
        if (!a.echeance) return 1
        if (!b.echeance) return -1
        return a.echeance.localeCompare(b.echeance)
      })
  }, [devoirs, onglet, filtreMat])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const enRetard = devoirs.filter((d) => {
    if (d.statut !== 'a_faire' || !d.echeance) return false
    return parseISO(d.echeance) < today
  }).length
  const aFaireCount = devoirs.filter((d) => d.statut === 'a_faire').length
  const faitsCount = devoirs.filter((d) => d.statut === 'fait').length

  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-bold text-slate-800 mb-4">Suivi des devoirs</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <Clock size={18} className="text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800">{aFaireCount}</p>
          <p className="text-xs text-slate-500">À faire</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <AlertCircle size={18} className="text-red-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800">{enRetard}</p>
          <p className="text-xs text-slate-500">En retard</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <CheckCircle size={18} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800">{faitsCount}</p>
          <p className="text-xs text-slate-500">Accomplis</p>
        </div>
      </div>

      {/* Filtre matière */}
      <Select
        value={filtreMat}
        onChange={(e) => setFiltreMat(e.target.value)}
        className="mb-3"
      >
        <option value="">Toutes les matières</option>
        {matieres.map((m) => (
          <option key={m.id} value={m.id}>{m.nom}</option>
        ))}
      </Select>

      {/* Onglets */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setOnglet(key)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition
              ${onglet === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
            {key === 'a_faire' && aFaireCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full px-1.5">
                {aFaireCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">
              {onglet === 'fait' ? 'Aucun devoir accompli' : 'Aucun devoir en cours'}
            </p>
          </CardBody>
        </Card>
      ) : (
        filtered.map((d) => <CarteDevoir key={d.id} devoir={d} />)
      )}
    </div>
  )
}
