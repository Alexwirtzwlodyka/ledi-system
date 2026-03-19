import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/context/AuthContext'
import { lediTheme } from '../theme'

const links = [
  ['/', 'Dashboard'],
  ['/escribanos', 'Escribanos'],
  ['/adjuntos', 'Adjuntos'],
  ['/auditoria', 'Auditoría'],
  ['/usuarios', 'Usuarios'],
]

const exitAnimationMs = 2600

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!isLoggingOut) return

    const timeoutId = window.setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, exitAnimationMs)

    return () => window.clearTimeout(timeoutId)
  }, [isLoggingOut, logout, navigate])

  if (!user) return <Navigate to='/login' replace />

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', background: lediTheme.background }}>
      <aside
        style={{
          position: 'relative',
          borderRight: `1px solid ${lediTheme.border}`,
          padding: 20,
          background: lediTheme.surfaceAlt,
          boxShadow: '0 0 24px rgba(91, 111, 46, 0.08)',
          overflow: 'hidden',
        }}
      >
        <h2 style={{ color: lediTheme.title, marginTop: 0 }}>LeDi</h2>
        <div style={{ color: lediTheme.textMuted, marginBottom: 20 }}>{user.username} · {user.role}</div>
        <nav style={{ display: 'grid', gap: 10 }}>
          {links.map(([to, label], index) => {
            const isHovered = hoveredLink === to

            return (
              <Link
                key={to}
                to={to}
                onMouseEnter={() => setHoveredLink(to)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  color: lediTheme.link,
                  textDecoration: 'none',
                  fontWeight: 700,
                  background: lediTheme.surface,
                  border: `1px solid ${lediTheme.border}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  boxShadow: '0 4px 0 rgba(91, 111, 46, 0.18), 0 10px 18px rgba(91, 111, 46, 0.08)',
                  transform: isLoggingOut
                    ? `translateY(${420 + index * 88}px)`
                    : isHovered
                      ? 'translateX(6px)'
                      : 'translateX(0)',
                  opacity: isLoggingOut ? 0 : 1,
                  pointerEvents: isLoggingOut ? 'none' : 'auto',
                  transition: isLoggingOut
                    ? `transform 1450ms cubic-bezier(0.22, 0.7, 0.2, 1) ${index * 140}ms, opacity 780ms ease ${index * 140 + 360}ms, box-shadow 140ms ease`
                    : 'transform 180ms ease, box-shadow 140ms ease, opacity 200ms ease',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <button
          type='button'
          onClick={() => setShowLogoutConfirm(true)}
          disabled={isLoggingOut}
          style={{
            marginTop: 24,
            padding: '10px 14px',
            borderRadius: 10,
            border: `1px solid ${lediTheme.border}`,
            background: lediTheme.surface,
            color: lediTheme.title,
            cursor: isLoggingOut ? 'default' : 'pointer',
            boxShadow: '0 4px 0 rgba(91, 111, 46, 0.18), 0 10px 18px rgba(91, 111, 46, 0.08)',
            transform: isLoggingOut ? 'translateY(620px)' : 'translateY(0)',
            opacity: isLoggingOut ? 0 : 1,
            transition: isLoggingOut
              ? 'transform 1500ms cubic-bezier(0.22, 0.7, 0.2, 1) 820ms, opacity 760ms ease 1100ms'
              : 'transform 180ms ease, opacity 200ms ease',
          }}
        >
          Cerrar sesión
        </button>
      </aside>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
      {showLogoutConfirm ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(45, 55, 24, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 340,
              background: lediTheme.surface,
              border: `1px solid ${lediTheme.border}`,
              borderRadius: 18,
              padding: 20,
              boxShadow: '0 24px 40px rgba(45, 55, 24, 0.22)',
              textAlign: 'center',
            }}
          >
            <div style={{ color: lediTheme.title, fontWeight: 700, marginBottom: 10, fontSize: 18 }}>Confirmar salida</div>
            <div style={{ color: lediTheme.textMuted, fontSize: 16, fontWeight: 700, lineHeight: 1.45, marginBottom: 18 }}>
              Usted está saliendo de LeDi
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type='button'
                onClick={() => {
                  setShowLogoutConfirm(false)
                  setIsLoggingOut(true)
                }}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${lediTheme.border}`,
                  background: '#f6e5b8',
                  color: lediTheme.title,
                  cursor: 'pointer',
                }}
              >
                Aceptar
              </button>
              <button
                type='button'
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${lediTheme.border}`,
                  background: '#fff',
                  color: lediTheme.textMuted,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
