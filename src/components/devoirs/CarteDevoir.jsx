import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'

function echeanceLabel(dateStr) {
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

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = devoir.echeance ? parseISO(devoir.echeance) : null
  const isLate = due && due < today && devoir.statut === 'a_faire'
  const isDone = devoir.statut === 'fait'
  const label = echeanceLabel(devoir.echeance)

  const borderColor = isDone ? '#10B981' : isLate ? '#EF4444' : '#F59E0B'
  const bgGradient = isDone
    ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
    : isLate
    ? 'linear-gradient(135deg, #FEF2F2, #FEE2E2)'
    : 'linear-gradient(135deg, #FFFBEB, #FEF3C7)'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-card"
      style={{ boxShadow: '0 2px 8px rgba(14,27,77,.05)', borderLeft: `3px solid ${borderColor}` }}>
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isDone
              ? <CheckCircle size={20} className="text-emerald-500" />
              : isLate
              ? <AlertCircle size={20} className="text-red-500" />
              : <Clock size={20} className="text-amber-500" />
            }
          </div>

          <div className="flex-1 min-w-0">
            {showMatiere && matiere && (
              <span className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: matiere.couleur }}>
                {matiere.nom}
              </span>
            )}
            <p className={`text-sm font-medium leading-relaxed ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {devoir.description}
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {label && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border
                  ${isLate ? 'bg-red-50 text-red-700 border-red-200' : isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  <Clock size={10} />
                  {label}
                </span>
              )}
              {isDone && devoir.confirme_par_nom && (
                <span className="text-xs text-slate-400">✓ {devoir.confirme_par_nom}</span>
              )}
            </div>
          </div>

          {/* Confirm button for delegate */}
          {!isDone && isDelegue && (
            <button onClick={() => confirmerDevoir(devoir.id, user.id, user.nom)}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #065F46, #10B981)', boxShadow: '0 2px 8px rgba(16,185,129,.3)' }}>
              Confirmer ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
