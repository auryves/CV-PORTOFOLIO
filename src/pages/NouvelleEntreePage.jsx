import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, BookOpen, FileText, ClipboardList } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Input, Textarea, Select } from '../components/ui/Input'
import { UploadDocument } from '../components/upload/UploadDocument'

function Section({ icon: Icon, title, children, color = 'text-blue-600', bg = 'bg-blue-50' }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(14,27,77,.06)' }}>
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100"
        style={{ background: 'linear-gradient(to right, #F8FAFF, #EFF6FF)' }}>
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}

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
  const [withDevoir, setWithDevoir] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = field => e => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.matiere_id) e.matiere_id = 'Choisissez une matière'
    if (!form.date) e.date = 'Date requise'
    if (!form.contenu.trim()) e.contenu = 'Décrivez le contenu du cours'
    if (withDevoir && !devoir.description.trim()) e.devoir = 'Décrivez le devoir'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    const entreeId = uuidv4()
    ajouterEntree({
      id: entreeId, ...form,
      created_by: user?.id,
      created_at: new Date().toISOString(),
      document: document ? { id: uuidv4(), nom: document.nom, type: document.type, url: document.dataUrl || null, parties: document.parties } : null,
    })
    if (withDevoir && devoir.description.trim()) {
      ajouterDevoir({ id: uuidv4(), entree_id: entreeId, matiere_id: form.matiere_id, description: devoir.description, echeance: devoir.echeance || null, statut: 'a_faire', confirme_par: null, confirme_le: null })
    }
    setSaving(false)
    navigate(`/cours/${entreeId}`)
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Nouvelle entrée</h1>
          <p className="text-xs text-slate-500">Enregistrez le cours d'aujourd'hui</p>
        </div>
      </div>

      <Section icon={BookOpen} title="Informations du cours" color="text-blue-600" bg="bg-blue-50">
        <Select label="Matière *" value={form.matiere_id} onChange={set('matiere_id')} error={errors.matiere_id}>
          <option value="">Sélectionner une matière...</option>
          {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date *" type="date" value={form.date} onChange={set('date')} error={errors.date} />
          <Input label="Professeur" value={form.professeur_nom} onChange={set('professeur_nom')} placeholder="Nom du prof" />
        </div>
        <Textarea label="Contenu abordé *" value={form.contenu} onChange={set('contenu')} rows={5}
          placeholder="Chapitres, notions, exercices traités durant ce cours..." error={errors.contenu} />
      </Section>

      <Section icon={FileText} title="Support de cours" color="text-purple-600" bg="bg-purple-50">
        <UploadDocument value={document} onChange={setDocument} />
      </Section>

      <Section icon={ClipboardList} title="Devoir à faire" color="text-amber-600" bg="bg-amber-50">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
            ${withDevoir ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}
            onClick={() => setWithDevoir(v => !v)}>
            {withDevoir && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-sm font-semibold text-slate-700">Ajouter un devoir</span>
        </label>
        {withDevoir && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <Textarea label="Description *" value={devoir.description}
              onChange={e => { setDevoir(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, devoir: undefined })) }}
              rows={3} placeholder="Exercices, rédaction, révisions à préparer..." error={errors.devoir} />
            <Input label="Date d'échéance" type="date" value={devoir.echeance}
              onChange={e => setDevoir(p => ({ ...p, echeance: e.target.value }))} />
          </div>
        )}
      </Section>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', boxShadow: '0 4px 20px rgba(37,99,235,.40)' }}>
        <Save size={16} />
        {saving ? 'Enregistrement...' : 'Enregistrer le cours'}
      </button>
    </div>
  )
}
