import { useState, useRef } from 'react'
import { Upload, FileText, Image, X } from 'lucide-react'
import { Button } from '../ui/Button'

function genererPartiesDemo(nomFichier) {
  const chapitres = [
    'Introduction et objectifs du cours',
    'Rappels et prérequis',
    'Concepts fondamentaux',
    'Développements théoriques',
    'Exemples et cas pratiques',
    'Exercices d\'application',
    'Synthèse et conclusion',
  ]
  const n = Math.floor(Math.random() * 3) + 3
  return chapitres.slice(0, n).map((titre, i) => ({
    id: `p${i + 1}`,
    titre: `${i + 1}. ${titre}`,
    traitee: false,
  }))
}

export function UploadDocument({ value, onChange }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const parties = genererPartiesDemo(file.name)
      onChange({
        nom: file.name,
        type: isPdf ? 'pdf' : 'image',
        dataUrl: e.target.result,
        parties,
      })
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function togglePartie(id) {
    if (!value) return
    onChange({
      ...value,
      parties: value.parties.map((p) =>
        p.id === id ? { ...p, traitee: !p.traitee } : p
      ),
    })
  }

  function toggleAll(state) {
    if (!value) return
    onChange({ ...value, parties: value.parties.map((p) => ({ ...p, traitee: state })) })
  }

  if (value) {
    const traitees = value.parties.filter((p) => p.traitee).length
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            {value.type === 'pdf' ? (
              <FileText size={20} className="text-blue-600" />
            ) : (
              <Image size={20} className="text-blue-600" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-800">{value.nom}</p>
              <p className="text-xs text-slate-500">{traitees}/{value.parties.length} sections traitées</p>
            </div>
          </div>
          <button onClick={() => onChange(null)} className="p-1 text-slate-400 hover:text-red-600 transition">
            <X size={16} />
          </button>
        </div>

        {value.type === 'image' && value.dataUrl && (
          <img src={value.dataUrl} alt="Support" className="w-full rounded-lg border border-slate-200 max-h-48 object-cover" />
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Sections traitées en classe</p>
            <div className="flex gap-2">
              <button onClick={() => toggleAll(true)} className="text-xs text-blue-600 hover:underline">Tout cocher</button>
              <span className="text-slate-300">|</span>
              <button onClick={() => toggleAll(false)} className="text-xs text-slate-500 hover:underline">Tout décocher</button>
            </div>
          </div>
          <div className="space-y-2">
            {value.parties.map((p) => (
              <label key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={p.traitee}
                  onChange={() => togglePartie(p.id)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className={`text-sm ${p.traitee ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                  {p.titre}
                </span>
                {p.traitee && <span className="ml-auto text-xs text-emerald-600 font-medium">✓ Traité</span>}
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <Upload size={32} className="mx-auto mb-3 text-slate-400" />
      <p className="text-sm font-medium text-slate-700 mb-1">Glissez un fichier ici</p>
      <p className="text-xs text-slate-500 mb-3">PDF ou image (JPG, PNG)</p>
      <Button size="sm" variant="secondary" type="button">
        Choisir un fichier
      </Button>
    </div>
  )
}
