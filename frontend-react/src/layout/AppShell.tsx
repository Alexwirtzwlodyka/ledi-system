import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { lediTheme } from '../theme'

const links = [
  ['/', 'Dashboard'],
  ['/escribanos', 'Escribanos'],
  ['/usuarios', 'Usuarios'],
  ['/adjuntos', 'Adjuntos'],
  ['/auditoria', 'AuditorÃ­a'],
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to='/login' replace />

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', background: lediTheme.background }}>
      <aside
        style={{
          borderRight: `1px solid ${lediTheme.border}`,
          padding: 20,
          background: lediTheme.surfaceAlt,
          boxShadow: '0 0 24px rgba(91, 111, 46, 0.08)',
        }}
      >
        <h2 style={{ color: lediTheme.title, marginTop: 0 }}>LeDi</h2>
        <div style={{ color: lediTheme.textMuted, marginBottom: 20 }}>{user.username} Â· {user.role}</div>
        <nav style={{ display: 'grid', gap: 10 }}>
          {links.map(([to, label]) => (
            <Link key={to} to={to} style={{ color: lediTheme.link, textDecoration: 'none', fontWeight: 600 }}>{label}</Link>
          ))}
        </nav>
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            marginTop: 24,
            padding: '10px 14px',
            borderRadius: 10,
            border: `1px solid ${lediTheme.border}`,
            background: lediTheme.surface,
            color: lediTheme.title,
            cursor: 'pointer',
          }}
        >
          Cerrar sesiÃ³n
        </button>
      </aside>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
