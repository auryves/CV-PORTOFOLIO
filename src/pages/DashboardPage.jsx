import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BookOpen, ClipboardList, CheckCircle, Clock, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CarteEntree } from '../components/cours/CarteEntree'
import { CarteDevoir } from '../components/devoirs/CarteDevoir'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-600">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user, isProf } = useAuth()
  const { entrees, devoirs } = useData()
  const navigate = useNavigate()

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const devoirsAFaire = devoirs.filter((d) => d.statut === 'a_faire')
  const devoirsFaits = devoirs.filter((d) => d.statut === 'fait')
  const entreesRecentes = entrees.slice(0, 3)
  const devoirsUrgents = devoirsAFaire.slice(0, 3)
  const dateLabel = format(today, "EEEE d MMMM yyyy", { locale: fr })

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Greeting */}
      <div className="pt-1">
        <p className="text-xs text-slate-500 capitalize">{dateLabel}</p>
        <h1 className="text-xl font-bold text-slate-800 mt-0.5">
          Bonjour, {user?.nom?.split(' ').slice(-1)[0]} 👋
        </h1>
        <p className="text-sm text-slate-500">
          {user?.classe} · {user?.role === 'professeur' ? 'Professeur' : 'Délégué(e)'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={BookOpen}
          label="Cours enregistrés"
          value={entrees.length}
          color="bg-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={ClipboardList}
          label="Devoirs en cours"
          value={devoirsAFaire.length}
          color="bg-amber-500"
          bg="bg-amber-50"
        />
        <StatCard
          icon={CheckCircle}
          label="Devoirs accomplis"
          value={devoirsFaits.length}
          color="bg-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={Clock}
          label="Total devoirs"
          value={devoirs.length}
          color="bg-slate-500"
          bg="bg-slate-100"
        />
      </div>

      {/* Action rapide (prof) */}
      {isProf && (
        <Card className="bg-gradient-to-r from-blue-700 to-blue-600 border-0">
          <CardBody className="py-4">
            <p className="text-white font-semibold mb-1">Nouveau cours</p>
            <p className="text-blue-200 text-xs mb-3">Enregistrez le cours d'aujourd'hui</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/cours/nouveau')}
              className="bg-white text-blue-700 border-0 hover:bg-blue-50"
            >
              <Plus size={15} />
              Ajouter une entrée
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Devoirs urgents */}
      {devoirsUrgents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-700">Devoirs à faire</h2>
            <button
              onClick={() => navigate('/devoirs')}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Voir tout
            </button>
          </div>
          {devoirsUrgents.map((d) => (
            <CarteDevoir key={d.id} devoir={d} />
          ))}
        </section>
      )}

      {/* Derniers cours */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700">Derniers cours</h2>
          <button
            onClick={() => navigate('/cours')}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Voir tout
          </button>
        </div>
        {entreesRecentes.length === 0 ? (
          <Card>
            <CardBody className="text-center py-8">
              <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Aucun cours enregistré</p>
            </CardBody>
          </Card>
        ) : (
          entreesRecentes.map((e) => <CarteEntree key={e.id} entree={e} />)
        )}
      </section>
    </div>
  )
}
