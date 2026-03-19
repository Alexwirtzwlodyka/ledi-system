import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../features/auth/context/AuthContext'
import { apiGet } from '../api/http'
import { lediTheme } from '../theme'

type DashboardCount = {
  title: string
  description: string
  total: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState<DashboardCount[]>([
    { title: 'Usuarios', description: 'Control de accesos y roles', total: 0 },
    { title: 'Escribanos', description: 'Padrón y mantenimiento', total: 0 },
    { title: 'Adjuntos', description: 'Legajos PDF cifrados', total: 0 },
    { title: 'Auditoría', description: 'Trazabilidad de eventos críticos', total: 0 },
  ])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiGet<{ total: number }>('/users'),
      apiGet<{ total: number }>('/escribanos'),
      apiGet<{ total: number }>('/adjuntos'),
      apiGet<{ total: number }>('/audit'),
    ]).then(([users, escribanos, adjuntos, audit]) => {
      setCards([
        { title: 'Usuarios', description: 'Control de accesos y roles', total: users.total ?? 0 },
        { title: 'Escribanos', description: 'Padrón y mantenimiento', total: escribanos.total ?? 0 },
        { title: 'Adjuntos', description: 'Legajos PDF cifrados', total: adjuntos.total ?? 0 },
        { title: 'Auditoría', description: 'Trazabilidad de eventos críticos', total: audit.total ?? 0 },
      ])
    }).catch((e) => {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el dashboard')
    })
  }, [])

  return (
    <div>
      <PageHeader title='Dashboard' subtitle={`Bienvenido ${user?.username ?? ''}. Resumen operativo inicial del sistema LeDi`} />
      {error ? <div style={{ color: '#b42318', marginBottom: 12 }}>{error}</div> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: lediTheme.surface,
              border: `1px solid ${lediTheme.border}`,
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 10px 20px rgba(91, 111, 46, 0.06)',
            }}
          >
            <strong style={{ display: 'block', marginBottom: 8, color: lediTheme.title }}>{card.title}</strong>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginBottom: 10, color: lediTheme.link }}>{card.total}</div>
            <span style={{ color: lediTheme.textMuted }}>{card.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
