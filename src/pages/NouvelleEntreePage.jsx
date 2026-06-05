import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Input, Textarea, Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { UploadDocument } from '../components/upload/UploadDocument'

export function NouvelleEntreePage() {
  const { matieres, ajouterEntree, ajouterDevoir } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    matiere_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    contenu: '',
    professeur_nom: user?.nom || '',
  })
  const [document, setDocument] = useState(null)
  const [devoir, setDevoir] = useState({ description: '', echeance: '' })
  const [ajouterDevoirFlag, setAjouterDevoirFlag] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function validate() {
    const e = {}
    if (!form.matiere_id) e.matiere_id = 'Veuillez choisir une matière'
    if (!form.date) e.date = 'La date est obligatoire'
    if (!form.contenu.trim()) e.contenu = 'Décrivez le contenu du cours'
    if (ajouterDevoirFlag && !devoir.description.trim()) e.devoir = 'Décrivez le devoir'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setSaving(true)
    const entreeId = uuidv4()
    const entree = {
      id: entreeId,
      ...form,
      created_by: user?.id,
      created_at: new Date().toISOString(),
      document: document
        ? {
            id: uuidv4(),
            nom: document.nom,
            type: document.type,
            url: document.dataUrl || null,
            parties: document.parties,
          }
        : null,
    }
    ajouterEntree(entree)

    if (ajouterDevoirFlag && devoir.description.trim()) {
      ajouterDevoir({
        id: uuidv4(),
        entree_id: entreeId,
        matiere_id: form.matiere_id,
        description: devoir.description,
        echeance: devoir.echeance || null,
        statut: 'a_faire',
        confirme_par: null,
        confirme_le: null,
      })
    }

    setSaving(false)
    navigate(`/cours/${entreeId}`)
  }

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Nouvelle entrée de cours</h1>
      </div>

      {/* Infos cours */}
      <Card>
        <CardBody className="space-y-3">
          <Select
            label="Matière *"
            value={form.matiere_id}
            onChange={set('matiere_id')}
            error={errors.matiere_id}
          >
            <option value="">Sélectionner une matière</option>
            {matieres.map((m) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </Select>

          <Input
            label="Date du cours *"
            type="date"
            value={form.date}
            onChange={set('date')}
            error={errors.date}
          />

          <Input
            label="Professeur"
            value={form.professeur_nom}
            onChange={set('professeur_nom')}
            placeholder="Nom du professeur"
          />

          <Textarea
            label="Contenu abordé *"
            value={form.contenu}
            onChange={set('contenu')}
            rows={5}
            placeholder="Décrivez les sujets, chapitres et points traités durant ce cours..."
            error={errors.contenu}
          />
        </CardBody>
      </Card>

      {/* Upload support */}
      <Card>
        <CardBody>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Support de cours (optionnel)</h2>
          <UploadDocument value={document} onChange={setDocument} />
        </CardBody>
      </Card>

      {/* Devoir */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Devoir à faire</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ajouterDevoirFlag}
                onChange={(e) => setAjouterDevoirFlag(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm text-slate-600">Ajouter un devoir</span>
            </label>
          </div>
          {ajouterDevoirFlag && (
            <div className="space-y-3">
              <Textarea
                label="Description du devoir *"
                value={devoir.description}
                onChange={(e) => {
                  setDevoir((p) => ({ ...p, description: e.target.value }))
                  setErrors((p) => ({ ...p, devoir: undefined }))
                }}
                rows={3}
                placeholder="Ex : Exercices p.45-47, rédiger une synthèse..."
                error={errors.devoir}
              />
              <Input
                label="Date d'échéance"
                type="date"
                value={devoir.echeance}
                onChange={(e) => setDevoir((p) => ({ ...p, echeance: e.target.value }))}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Action */}
      <Button size="lg" className="w-full" onClick={handleSave} disabled={saving}>
        <Save size={16} />
        {saving ? 'Enregistrement...' : 'Enregistrer l\'entrée'}
      </Button>
    </div>
  )
}
