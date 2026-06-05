import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'

function formatEcheance(dateStr) {
  if (!dateStr) return null
  const d = parseISO(dateStr)
  if (isToday(d)) return "Aujourd'hui"
  if (isTomorrow(d)) return 'Demain'
  return format(d, 'd MMM', { locale: fr })
}

export function CarteDevoir({ devoir, showMatiere = true }) {
  const { getMatiere, confirmerDevoir } = useData()
  const { user, isDelegue } = useAuth()
  const matiere = getMatiere(devoir.matiere_id)

  const due = devoir.echeance ? parseISO(devoir.echeance) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isLate = due && due < today && devoir.statut === 'a_faire'
  const echeanceLabel = formatEcheance(devoir.echeance)

  return (
    <Card className={`mb-2.5 border-l-4 ${devoir.statut === 'fait' ? 'border-l-emerald-400' : isLate ? 'border-l-red-400' : 'border-l-amber-400'}`}>
      <CardBody className="py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {devoir.statut === 'fait' ? (
              <CheckCircle size={20} className="text-emerald-500" />
            ) : isLate ? (
              <AlertCircle size={20} className="text-red-500" />
            ) : (
              <Clock size={20} className="text-amber-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {showMatiere && matiere && (
              <span className="text-xs font-semibold uppercase tracking-wide mb-1 block" style={{ color: matiere.couleur }}>
                {matiere.nom}
              </span>
            )}
            <p className={`text-sm ${devoir.statut === 'fait' ? 'text-slate-400 line-through' : 'text-slate-700'} mb-1.5`}>
              {devoir.description}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {echeanceLabel && (
                <span className={`text-xs flex items-center gap-1 ${isLate ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                  <Clock size={11} />
                  Échéance : {echeanceLabel}
                </span>
              )}
              {devoir.statut === 'fait' && devoir.confirme_par_nom && (
                <span className="text-xs text-slate-400">Confirmé par {devoir.confirme_par_nom}</span>
              )}
            </div>
          </div>
          {devoir.statut === 'a_faire' && isDelegue && (
            <Button
              size="sm"
              variant="success"
              className="flex-shrink-0 text-xs"
              onClick={() => confirmerDevoir(devoir.id, user.id, user.nom)}
            >
              Confirmer
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
