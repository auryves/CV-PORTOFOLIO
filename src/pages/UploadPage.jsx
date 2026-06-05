import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, Save } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { UploadDocument } from '../components/upload/UploadDocument'

export function UploadPage() {
  const { entrees, modifierEntree } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [entreeId, setEntreeId] = useState('')
  const [document, setDocument] = useState(null)
  const [saved, setSaved] = useState(false)

  const entreeSaIds = entrees.filter((e) => !e.document).map((e) => e.id)
  const entreesSansDoc = entrees.filter((e) => !e.document)

  function handleSave() {
    if (!entreeId || !document) return
    const entree = entrees.find((e) => e.id === entreeId)
    if (!entree) return
    modifierEntree({
      ...entree,
      document: {
        id: uuidv4(),
        nom: document.nom,
        type: document.type,
        url: document.dataUrl || null,
        parties: document.parties,
      },
    })
    setSaved(true)
    setTimeout(() => navigate(`/cours/${entreeId}`), 1200)
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Ajouter un support</h1>
      </div>

      {saved ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardBody className="text-center py-8">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-emerald-700 font-semibold">Support enregistré !</p>
            <p className="text-sm text-emerald-600 mt-1">Redirection en cours...</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Choisir l'entrée */}
          <Card>
            <CardBody>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Associer à un cours
              </h2>
              {entreesSansDoc.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Tous les cours ont déjà un support de cours. Créez d'abord une nouvelle entrée.
                </p>
              ) : (
                <Select
                  value={entreeId}
                  onChange={(e) => { setEntreeId(e.target.value); setDocument(null) }}
                >
                  <option value="">Sélectionner un cours</option>
                  {entreesSansDoc.map((e) => {
                    const label = `${e.date} — ${e.contenu.slice(0, 40)}...`
                    return <option key={e.id} value={e.id}>{label}</option>
                  })}
                </Select>
              )}
            </CardBody>
          </Card>

          {/* Upload */}
          {entreeId && (
            <Card>
              <CardBody>
                <h2 className="text-sm font-semibold text-slate-700 mb-3">
                  Support de cours
                </h2>
                <UploadDocument value={document} onChange={setDocument} />
              </CardBody>
            </Card>
          )}

          {/* Save */}
          {entreeId && document && (
            <Button size="lg" className="w-full" onClick={handleSave}>
              <Save size={16} />
              Enregistrer le support
            </Button>
          )}
        </>
      )}
    </div>
  )
}
