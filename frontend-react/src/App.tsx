import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { EscribanosPage } from './pages/EscribanosPage'
import { UsuariosPage } from './pages/UsuariosPage'
import { AdjuntosPage } from './pages/AdjuntosPage'
import { AuthProvider } from './features/auth/context/AuthContext'
import { AuditoriaPage } from './pages/AuditoriaPage'
import { LibrosPage } from './pages/LibrosPage'

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/escribanos' element={<EscribanosPage />} />
          <Route path='/usuarios' element={<UsuariosPage />} />
          <Route path='/libros' element={<LibrosPage />} />
          <Route path='/adjuntos' element={<AdjuntosPage />} />
          <Route path='/auditoria' element={<AuditoriaPage />} />
        </Route>
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </AuthProvider>
  )
}
