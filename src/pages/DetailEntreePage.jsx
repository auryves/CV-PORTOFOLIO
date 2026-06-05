import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft, Pencil, Trash2, FileText, Image, CheckSquare, Square,
  User, Calendar, BookOpen, Save, X, Plus
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Textarea, Input, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { CarteDevoir } from '../components/devoirs/CarteDevoir'
import { ConfirmModal } from '../components/ui/Modal'

function SectionsList({ parties, onToggle, canEdit }) {
  const traitees = parties.filter((p) => p.traitee).length
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          Sections du document
        </p>
        <Badge variant="ghost" size="sm">{traitees}/{parties.length} traitées</Badge>
      </div>
      <div className="space-y-1.5">
        {parties.map((p) => (
          <div
            key={p.id}
            onClick={() => canEdit && onToggle(p.id)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition
              ${canEdit ? 'cursor-pointer' : ''}
              ${p.traitee ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
          >
            {p.traitee
              ? <CheckSquare size={16} className="text-emerald-600 flex-shrink-0" />
              : <Square size={16} className="text-slate-400 flex-shrink-0" />
            }
            <span className={`text-sm ${p.traitee ? 'text-emerald-800 font-medium' : 'text-slate-600'}`}>
              {p.titre}
            </span>
            {p.traitee && <span className="ml-auto text-xs text-emerald-600 font-medium">Traité</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function DetailEntreePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { entrees, getMatiere, getDevoirsEntree, modifierEntree, supprimerEntree, ajouterDevoir } = useData()
  const { isProf, isDelegue, user } = useAuth()

  const entree = entrees.find((e) => e.id === id)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [ajoutDevoir, setAjoutDevoir] = useState(false)
  const [nouveauDevoir, setNouveauDevoir] = useState({ description: '', echeance: '' })

  if (!entree) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-slate-500">Entrée introuvable</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/cours')}>
          Retour aux cours
        </Button>
      </div>
    )
  }

  const matiere = getMatiere(entree.matiere_id)
  const devoirs = getDevoirsEntree(entree.id)
  const dateFormatee = format(parseISO(entree.date), 'EEEE d MMMM yyyy', { locale: fr })

  function startEdit() {
    setEditForm({ contenu: entree.contenu, professeur_nom: entree.professeur_nom })
    setEditMode(true)
  }

  function saveEdit() {
    modifierEntree({ ...entree, ...editForm })
    setEditMode(false)
  }

  function toggleSection(partieId) {
    if (!entree.document) return
    const updated = {
      ...entree,
      document: {
        ...entree.document,
        parties: entree.document.parties.map((p) =>
          p.id === partieId ? { ...p, traitee: !p.traitee } : p
        ),
      },
    }
    modifierEntree(updated)
  }

  function handleAjouterDevoir() {
    if (!nouveauDevoir.description.trim()) return
    ajouterDevoir({
      id: uuidv4(),
      entree_id: entree.id,
      matiere_id: entree.matiere_id,
      description: nouveauDevoir.description,
      echeance: nouveauDevoir.echeance || null,
      statut: 'a_faire',
      confirme_par: null,
      confirme_le: null,
    })
    setNouveauDevoir({ description: '', echeance: '' })
    setAjoutDevoir(false)
  }

  function handleDelete() {
    supprimerEntree(entree.id)
    navigate('/cours')
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition mt-0.5 flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold text-blue-700">{matiere?.nom}</span>
          </div>
          <h1 className="text-base font-bold text-slate-800 capitalize">{dateFormatee}</h1>
        </div>
        {(isProf || isDelegue) && !editMode && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={startEdit}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Pencil size={16} />
            </button>
            {isProf && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenu */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} />
            <span className="capitalize">{dateFormatee}</span>
          </div>
          {entree.professeur_nom && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <User size={14} />
              <span>{entree.professeur_nom}</span>
            </div>
          )}
        </CardHeader>
        <CardBody>
          {editMode ? (
            <div className="space-y-3">
              <Input
                label="Professeur"
                value={editForm.professeur_nom}
                onChange={(e) => setEditForm((p) => ({ ...p, professeur_nom: e.target.value }))}
              />
              <Textarea
                label="Contenu abordé"
                value={editForm.contenu}
                onChange={(e) => setEditForm((p) => ({ ...p, contenu: e.target.value }))}
                rows={6}
              />
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={saveEdit}><Save size={14} /> Sauvegarder</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}><X size={14} /> Annuler</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{entree.contenu}</p>
          )}
        </CardBody>
      </Card>

      {/* Document */}
      {entree.document && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              {entree.document.type === 'pdf'
                ? <FileText size={18} className="text-blue-600" />
                : <Image size={18} className="text-blue-600" />
              }
              <span className="text-sm font-medium text-slate-700">{entree.document.nom}</span>
            </div>
            {entree.document.url && entree.document.type === 'image' && (
              <img
                src={entree.document.url}
                alt="Support"
                className="w-full rounded-lg border border-slate-200 max-h-48 object-cover mb-3"
              />
            )}
            {entree.document.parties?.length > 0 && (
              <SectionsList
                parties={entree.document.parties}
                onToggle={toggleSection}
                canEdit={isProf || isDelegue}
              />
            )}
          </CardBody>
        </Card>
      )}

      {/* Devoirs */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700">Devoirs</h2>
          {isProf && !ajoutDevoir && (
            <Button size="sm" variant="ghost" onClick={() => setAjoutDevoir(true)}>
              <Plus size={14} /> Ajouter
            </Button>
          )}
        </div>

        {ajoutDevoir && (
          <Card className="mb-3 border-blue-200">
            <CardBody className="space-y-3">
              <Textarea
                label="Description du devoir"
                value={nouveauDevoir.description}
                onChange={(e) => setNouveauDevoir((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Décrire le travail à faire..."
              />
              <Input
                label="Date d'échéance"
                type="date"
                value={nouveauDevoir.echeance}
                onChange={(e) => setNouveauDevoir((p) => ({ ...p, echeance: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAjouterDevoir}><Save size={14} /> Ajouter</Button>
                <Button size="sm" variant="ghost" onClick={() => setAjoutDevoir(false)}>Annuler</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {devoirs.length === 0 && !ajoutDevoir ? (
          <p className="text-sm text-slate-400 text-center py-4">Aucun devoir pour ce cours</p>
        ) : (
          devoirs.map((d) => <CarteDevoir key={d.id} devoir={d} showMatiere={false} />)
        )}
      </section>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer cette entrée ?"
        message="Cette action est irréversible. L'entrée de cours et tous ses devoirs associés seront supprimés."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  )
}
