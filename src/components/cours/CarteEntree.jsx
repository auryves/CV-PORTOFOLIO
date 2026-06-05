import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronRight, Paperclip, CheckSquare } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { StatutDevoir } from '../ui/Badge'

export function CarteEntree({ entree }) {
  const navigate = useNavigate()
  const { getMatiere, getDevoirsEntree } = useData()
  const matiere = getMatiere(entree.matiere_id)
  const devoirs = getDevoirsEntree(entree.id)
  const dateStr = format(parseISO(entree.date), 'EEE d MMM', { locale: fr })
  const parties = entree.document?.parties || []
  const traitees = parties.filter(p => p.traitee).length

  return (
    <div onClick={() => navigate(`/cours/${entree.id}`)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden
      cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-blue-200"
      style={{ boxShadow: '0 2px 8px rgba(14,27,77,.06)' }}>
      {/* Color top bar */}
      <div className="h-1 w-full" style={{ background: matiere?.couleur || '#3B82F6' }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Matière icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold"
            style={{ background: `${matiere?.couleur}18`, color: matiere?.couleur }}>
            {matiere?.code?.slice(0, 2) || '??'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: matiere?.couleur }}>
                {matiere?.nom}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400 font-medium capitalize">{dateStr}</span>
            </div>

            <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed mb-2.5">
              {entree.contenu}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {entree.document && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                  <CheckSquare size={11} />
                  {traitees}/{parties.length} sections
                </span>
              )}
              {devoirs.map(d => (
                <StatutDevoir key={d.id} statut={d.statut} echeance={d.echeance} />
              ))}
            </div>
          </div>

          <ChevronRight size={16}
            className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
        </div>
      </div>
    </div>
  )
}
