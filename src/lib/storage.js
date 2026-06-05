import { ENTREES_COURS, DEVOIRS, MATIERES } from './mockData'

const KEYS = {
  entrees: 'ctn_entrees',
  devoirs: 'ctn_devoirs',
  matieres: 'ctn_matieres',
}

function getItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function initStorage() {
  if (!localStorage.getItem(KEYS.entrees)) setItem(KEYS.entrees, ENTREES_COURS)
  if (!localStorage.getItem(KEYS.devoirs)) setItem(KEYS.devoirs, DEVOIRS)
  if (!localStorage.getItem(KEYS.matieres)) setItem(KEYS.matieres, MATIERES)
}

export function resetStorage() {
  setItem(KEYS.entrees, ENTREES_COURS)
  setItem(KEYS.devoirs, DEVOIRS)
  setItem(KEYS.matieres, MATIERES)
}

// --- Matieres ---
export function getMatieres() {
  return getItem(KEYS.matieres, MATIERES)
}

// --- Entrees ---
export function getEntrees() {
  return getItem(KEYS.entrees, ENTREES_COURS)
}

export function getEntree(id) {
  return getEntrees().find((e) => e.id === id) || null
}

export function saveEntree(entree) {
  const entrees = getEntrees()
  const idx = entrees.findIndex((e) => e.id === entree.id)
  if (idx >= 0) {
    entrees[idx] = entree
  } else {
    entrees.unshift(entree)
  }
  setItem(KEYS.entrees, entrees)
  return entree
}

export function deleteEntree(id) {
  const entrees = getEntrees().filter((e) => e.id !== id)
  setItem(KEYS.entrees, entrees)
}

// --- Devoirs ---
export function getDevoirs() {
  return getItem(KEYS.devoirs, DEVOIRS)
}

export function getDevoir(id) {
  return getDevoirs().find((d) => d.id === id) || null
}

export function saveDevoir(devoir) {
  const devoirs = getDevoirs()
  const idx = devoirs.findIndex((d) => d.id === devoir.id)
  if (idx >= 0) {
    devoirs[idx] = devoir
  } else {
    devoirs.unshift(devoir)
  }
  setItem(KEYS.devoirs, devoirs)
  return devoir
}

export function deleteDevoir(id) {
  const devoirs = getDevoirs().filter((d) => d.id !== id)
  setItem(KEYS.devoirs, devoirs)
}

export function getDevoirsForEntree(entreeId) {
  return getDevoirs().filter((d) => d.entreeId === entreeId || d.entree_id === entreeId)
}
