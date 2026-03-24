import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { apiGet } from '../api/http'
import type { Escribano } from '../features/escribanos/types'
import { useAuth } from '../features/auth/context/AuthContext'
import type { UserItem } from '../features/users/types'
import { ruellTheme } from '../theme'

type DashboardCount = {
  title: string
  description: string
  total: number
}

type ActivePresenceResponse = {
  users: UserItem[]
  escribanos: Escribano[]
  users_total: number
  escribanos_total: number
}

type FloatingCardProps = {
  title: string
  subtitle: string
  children: ReactNode
}

function FloatingCard({ title, subtitle, children }: FloatingCardProps) {
  return (
    <section
      style={{
        background: '#c8ced4',
        border: '1px solid #aeb6be',
        borderRadius: 18,
        padding: 18,
        boxShadow: '0 16px 28px rgba(91, 111, 46, 0.08)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 6, color: ruellTheme.title }}>{title}</strong>
        <span style={{ color: ruellTheme.textMuted }}>{subtitle}</span>
      </div>
      {children}
    </section>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState<DashboardCount[]>([
    { title: 'Usuarios', description: 'Control de accesos y roles', total: 0 },
    { title: 'Escribanos', description: 'Padron y mantenimiento', total: 0 },
    { title: 'Adjuntos', description: 'Legajos PDF cifrados', total: 0 },
    { title: 'Libros', description: 'PDFs vinculados por registro', total: 0 },
    { title: 'Auditoria', description: 'Trazabilidad de eventos criticos', total: 0 },
  ])
  const [users, setUsers] = useState<UserItem[]>([])
  const [escribanos, setEscribanos] = useState<Escribano[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTotals = async () => {
      try {
        const [usersResponse, escribanosResponse, adjuntos, libros, audit] = await Promise.all([
          apiGet<{ total: number }>('/users'),
          apiGet<{ total: number }>('/escribanos'),
          apiGet<{ total: number }>('/adjuntos'),
          apiGet<{ total: number }>('/libros'),
          apiGet<{ total: number }>('/audit'),
        ])

        setCards([
          { title: 'Usuarios', description: 'Control de accesos y roles', total: usersResponse.total ?? 0 },
          { title: 'Escribanos', description: 'Padron y mantenimiento', total: escribanosResponse.total ?? 0 },
          { title: 'Adjuntos', description: 'Legajos PDF cifrados', total: adjuntos.total ?? 0 },
          { title: 'Libros', description: 'PDFs vinculados por registro', total: libros.total ?? 0 },
          { title: 'Auditoria', description: 'Trazabilidad de eventos criticos', total: audit.total ?? 0 },
        ])
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar el dashboard')
      }
    }

    const loadActivePresence = async () => {
      try {
        const activePresence = await apiGet<ActivePresenceResponse>('/auth/active')
        setUsers(activePresence.users ?? [])
        setEscribanos(activePresence.escribanos ?? [])
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar la presencia activa')
      }
    }

    loadTotals()
    loadActivePresence()
    const presenceInterval = window.setInterval(loadActivePresence, 60_000)

    return () => {
      window.clearInterval(presenceInterval)
    }
  }, [])

  return (
    <div>
      <PageHeader title='Dashboard' subtitle={`Bienvenido ${user?.username ?? ''}. Resumen operativo inicial del sistema RUELL`} />
      {error ? <div style={{ color: '#b42318', marginBottom: 12 }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: ruellTheme.surface,
              border: `1px solid ${ruellTheme.border}`,
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 10px 20px rgba(91, 111, 46, 0.06)',
            }}
          >
            <strong style={{ display: 'block', marginBottom: 8, color: ruellTheme.title }}>{card.title}</strong>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginBottom: 10, color: ruellTheme.link }}>{card.total}</div>
            <span style={{ color: ruellTheme.textMuted }}>{card.description}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <FloatingCard title='Usuarios del sistema' subtitle='Usuarios activos en este momento. Se refresca cada 1 minuto'>
          <div style={{ display: 'grid', gap: 12 }}>
            {users.length ? (
              users.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#d8dde2',
                    border: '1px solid #b7c0c8',
                    borderRadius: 14,
                    padding: 14,
                    boxShadow: '0 8px 18px rgba(71, 85, 105, 0.10)',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 4, color: ruellTheme.title }}>{item.username}</strong>
                  <div style={{ color: ruellTheme.textMuted, marginBottom: 4 }}>{item.email}</div>
                  <div style={{ color: ruellTheme.textMuted, marginBottom: 4 }}>DNI: {item.dni}</div>
                  <div style={{ color: ruellTheme.textMuted }}>Rol: {item.role}</div>
                </div>
              ))
            ) : (
              <span style={{ color: ruellTheme.textMuted }}>No hay usuarios activos en este momento.</span>
            )}
          </div>
        </FloatingCard>

        <FloatingCard title='Escribanos del sistema' subtitle='Escribanos activos en este momento. Se refresca cada 1 minuto'>
          <div style={{ display: 'grid', gap: 12 }}>
            {escribanos.length ? (
              escribanos.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#d8dde2',
                    border: '1px solid #b7c0c8',
                    borderRadius: 14,
                    padding: 14,
                    boxShadow: '0 8px 18px rgba(71, 85, 105, 0.10)',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 4, color: ruellTheme.title }}>
                    {item.apellido}, {item.nombre}
                  </strong>
                  <div style={{ color: ruellTheme.textMuted, marginBottom: 4 }}>DNI: {item.dni}</div>
                  <div style={{ color: ruellTheme.textMuted, marginBottom: 4 }}>Matricula: {item.matricula}</div>
                  <div style={{ color: ruellTheme.textMuted }}>Registro: {item.registro}</div>
                </div>
              ))
            ) : (
              <span style={{ color: ruellTheme.textMuted }}>No hay escribanos activos en este momento.</span>
            )}
          </div>
        </FloatingCard>
      </div>
    </div>
  )
}
