import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { AuditTable } from '../features/audit/components/AuditTable'
import { apiGet } from '../api/http'

type AuditItem = { id: number; action: string; target_type: string; target_id: number | string; created_at: string }

export function AuditoriaPage() {
  const [items, setItems] = useState<AuditItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet<{ items: AuditItem[] }>('/audit')
      .then((data) => setItems(data.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar auditoría'))
  }, [])

  return (
    <div>
      <PageHeader title="Auditoría" subtitle="Eventos clave del sistema y operaciones sensibles" />
      {error ? <div style={{ color: '#b42318', marginBottom: 12 }}>{error}</div> : null}
      <AuditTable items={items} />
    </div>
  )
}
