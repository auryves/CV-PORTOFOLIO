import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, parseISO, getDay, addMonths, subMonths,
  startOfWeek, endOfWeek
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card, CardBody } from '../components/ui/Card'
import { CarteEntree } from '../components/cours/CarteEntree'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function CalendrierPage() {
  const { entrees, devoirs, getMatiere } = useData()
  const navigate = useNavigate()
  const [moisRef, setMoisRef] = useState(new Date())
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'))

  const debut = startOfMonth(moisRef)
  const fin = endOfMonth(moisRef)
  const debutSem = startOfWeek(debut, { weekStartsOn: 1 })
  const finSem = endOfWeek(fin, { weekStartsOn: 1 })
  const jours = eachDayOfInterval({ start: debutSem, end: finSem })

  const entreesDates = useMemo(() => {
    const map = {}
    entrees.forEach((e) => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [entrees])

  const devoirsDates = useMemo(() => {
    const map = {}
    devoirs.forEach((d) => {
      if (!d.echeance) return
      if (!map[d.echeance]) map[d.echeance] = []
      map[d.echeance].push(d)
    })
    return map
  }, [devoirs])

  const entreesSelected = entreesDates[selected] || []

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Calendrier</h1>

      <Card>
        <CardBody className="pb-2">
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setMoisRef(subMonths(moisRef, 1))}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-slate-800 capitalize">
              {format(moisRef, 'MMMM yyyy', { locale: fr })}
            </span>
            <button
              onClick={() => setMoisRef(addMonths(moisRef, 1))}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* En-têtes jours */}
          <div className="grid grid-cols-7 mb-1">
            {JOURS.map((j) => (
              <div key={j} className="text-center text-xs font-medium text-slate-400 py-1">{j}</div>
            ))}
          </div>

          {/* Grille calendrier */}
          <div className="grid grid-cols-7 gap-0.5">
            {jours.map((jour) => {
              const dateStr = format(jour, 'yyyy-MM-dd')
              const inMois = jour.getMonth() === moisRef.getMonth()
              const isSel = dateStr === selected
              const isAujourd = isToday(jour)
              const aCours = Boolean(entreesDates[dateStr])
              const aDevoir = Boolean(devoirsDates[dateStr])
              const coursMatiere = aCours
                ? getMatiere(entreesDates[dateStr][0].matiere_id)
                : null

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelected(dateStr)}
                  className={`relative flex flex-col items-center justify-center h-10 rounded-lg text-sm transition
                    ${!inMois ? 'opacity-30' : ''}
                    ${isSel ? 'bg-blue-700 text-white' : isAujourd ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'}
                  `}
                >
                  <span className={`text-sm ${isSel ? 'font-bold' : ''}`}>{format(jour, 'd')}</span>
                  {inMois && (
                    <div className="flex gap-0.5 mt-0.5">
                      {aCours && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: isSel ? 'white' : coursMatiere?.couleur || '#3B82F6' }}
                        />
                      )}
                      {aDevoir && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-amber-400'}`} />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Légende */}
          <div className="flex gap-4 justify-center mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Cours
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Devoir
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Entrées du jour sélectionné */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          {format(parseISO(selected), "d MMMM yyyy", { locale: fr })}
        </h2>
        {entreesSelected.length === 0 ? (
          <Card>
            <CardBody className="text-center py-6">
              <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">Aucun cours ce jour</p>
            </CardBody>
          </Card>
        ) : (
          entreesSelected.map((e) => <CarteEntree key={e.id} entree={e} />)
        )}

        {/* Devoirs du jour */}
        {devoirsDates[selected] && devoirsDates[selected].length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
              Devoirs à rendre
            </p>
            {devoirsDates[selected].map((d) => (
              <div key={d.id} className={`p-3 rounded-lg border mb-2 ${d.statut === 'fait' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`text-sm ${d.statut === 'fait' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {d.description}
                </p>
                <p className="text-xs mt-1 font-medium">
                  {d.statut === 'fait'
                    ? <span className="text-emerald-600">✓ Accompli</span>
                    : <span className="text-amber-600">À remettre</span>
                  }
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
