import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FileText, ChevronRight, BookOpen, Paperclip } from 'lucide-react'
import { Card, CardBody } from '../ui/Card'
import { Badge, StatutDevoir } from '../ui/Badge'
import { useData } from '../../contexts/DataContext'

export function CarteEntree({ entree }) {
  const navigate = useNavigate()
  const { getMatiere, getDevoirsEntree } = useData()
  const matiere = getMatiere(entree.matiere_id)
  const devoirs = getDevoirsEntree(entree.id)
  const dateFormatee = format(parseISO(entree.date), 'EEE d MMM yyyy', { locale: fr })
  const partiesTraitees = entree.document?.parties?.filter((p) => p.traitee).length || 0
  const totalParties = entree.document?.parties?.length || 0

  return (
    <Card
      hoverable
      onClick={() => navigate(`/cours/${entree.id}`)}
      className="mb-3"
    >
      <CardBody className="py-3">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${matiere?.couleur}20` }}
          >
            <BookOpen size={18} style={{ color: matiere?.couleur }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                {matiere?.nom}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 capitalize">{dateFormatee}</span>
            </div>
            <p className="text-sm text-slate-700 line-clamp-2 mb-2">{entree.contenu}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {entree.document && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Paperclip size={12} />
                  {partiesTraitees}/{totalParties} section{totalParties > 1 ? 's' : ''}
                </span>
              )}
              {devoirs.map((d) => (
                <StatutDevoir key={d.id} statut={d.statut} echeance={d.echeance} />
              ))}
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-1" />
        </div>
      </CardBody>
    </Card>
  )
}
