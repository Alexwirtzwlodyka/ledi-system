import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'

const links = [
  ['/', 'Dashboard'],
  ['/escribanos', 'Escribanos'],
  ['/usuarios', 'Usuarios'],
  ['/adjuntos', 'Adjuntos'],
  ['/auditoria', 'Auditoría'],
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to='/login' replace />

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', background: '#f5f1e8' }}>
      <aside style={{ borderRight: '1px solid #d8e1eb', padding: 20, background: '#fbfaf7' }}>
        <h2 style={{ color: '#1f3a5f', marginTop: 0 }}>LeDi</h2>
        <div style={{ color: '#5e718d', marginBottom: 20 }}>{user.username} · {user.role}</div>
        <nav style={{ display: 'grid', gap: 10 }}>
          {links.map(([to, label]) => (
            <Link key={to} to={to} style={{ color: '#3567a6', textDecoration: 'none' }}>{label}</Link>
          ))}
        </nav>
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{ marginTop: 24, padding: '10px 14px', borderRadius: 10, border: '1px solid #c8d4e3', background: '#fff', cursor: 'pointer' }}
        >
          Cerrar sesión
        </button>
      </aside>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
