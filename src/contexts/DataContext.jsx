import { createContext, useContext, useState, useCallback } from 'react'
import {
  getEntrees, saveEntree, deleteEntree,
  getDevoirs, saveDevoir, deleteDevoir,
  getMatieres,
} from '../lib/storage'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [entrees, setEntrees] = useState(() => getEntrees())
  const [devoirs, setDevoirs] = useState(() => getDevoirs())
  const matieres = getMatieres()

  const refreshEntrees = useCallback(() => setEntrees(getEntrees()), [])
  const refreshDevoirs = useCallback(() => setDevoirs(getDevoirs()), [])

  function ajouterEntree(entree) {
    const saved = saveEntree(entree)
    setEntrees(getEntrees())
    return saved
  }

  function modifierEntree(entree) {
    saveEntree(entree)
    setEntrees(getEntrees())
  }

  function supprimerEntree(id) {
    deleteEntree(id)
    setEntrees(getEntrees())
  }

  function ajouterDevoir(devoir) {
    const saved = saveDevoir(devoir)
    setDevoirs(getDevoirs())
    return saved
  }

  function modifierDevoir(devoir) {
    saveDevoir(devoir)
    setDevoirs(getDevoirs())
  }

  function supprimerDevoir(id) {
    deleteDevoir(id)
    setDevoirs(getDevoirs())
  }

  function confirmerDevoir(id, userId, userName) {
    const devoir = devoirs.find((d) => d.id === id)
    if (!devoir) return
    saveDevoir({
      ...devoir,
      statut: 'fait',
      confirme_par: userId,
      confirme_par_nom: userName,
      confirme_le: new Date().toISOString(),
    })
    setDevoirs(getDevoirs())
  }

  function getMatiere(id) {
    return matieres.find((m) => m.id === id)
  }

  function getDevoirsEntree(entreeId) {
    return devoirs.filter((d) => d.entree_id === entreeId)
  }

  return (
    <DataContext.Provider
      value={{
        entrees,
        devoirs,
        matieres,
        getMatiere,
        getDevoirsEntree,
        ajouterEntree,
        modifierEntree,
        supprimerEntree,
        ajouterDevoir,
        modifierDevoir,
        supprimerDevoir,
        confirmerDevoir,
        refreshEntrees,
        refreshDevoirs,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
