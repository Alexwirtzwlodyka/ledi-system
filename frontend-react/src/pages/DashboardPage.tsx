import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../features/auth/context/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()
  const cards = [
    ['Usuarios', 'Control de accesos y roles'],
    ['Escribanos', 'Padrón y mantenimiento'],
    ['Adjuntos', 'Legajos PDF cifrados'],
    ['Auditoría', 'Trazabilidad de eventos críticos'],
  ]

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Bienvenido ${user?.username ?? ''}. Resumen operativo inicial del sistema LeDi`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        {cards.map(([title, desc]) => (
          <div key={title} style={{ background: '#fff', border: '1px solid #d8e1eb', borderRadius: 14, padding: 18 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>{title}</strong>
            <span style={{ color: '#5e718d' }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
