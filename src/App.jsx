import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { initStorage } from './lib/storage'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { CoursPage } from './pages/CoursPage'
import { NouvelleEntreePage } from './pages/NouvelleEntreePage'
import { DetailEntreePage } from './pages/DetailEntreePage'
import { DevoirsPage } from './pages/DevoirsPage'
import { CalendrierPage } from './pages/CalendrierPage'
import { UploadPage } from './pages/UploadPage'
import './index.css'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-blue-200">Chargement...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/connexion" replace />
  return children
}

function RequireProf({ children }) {
  const { isProf } = useAuth()
  if (!isProf) return <Navigate to="/tableau-de-bord" replace />
  return children
}

function StorageInit() {
  useEffect(() => { initStorage() }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <StorageInit />
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/connexion" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/tableau-de-bord" replace />} />
              <Route path="tableau-de-bord" element={<DashboardPage />} />
              <Route path="cours" element={<CoursPage />} />
              <Route
                path="cours/nouveau"
                element={
                  <RequireProf>
                    <NouvelleEntreePage />
                  </RequireProf>
                }
              />
              <Route path="cours/:id" element={<DetailEntreePage />} />
              <Route path="devoirs" element={<DevoirsPage />} />
              <Route path="calendrier" element={<CalendrierPage />} />
              <Route
                path="upload"
                element={
                  <RequireProf>
                    <UploadPage />
                  </RequireProf>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/tableau-de-bord" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
