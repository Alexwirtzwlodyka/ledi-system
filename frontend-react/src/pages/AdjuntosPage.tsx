import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { AdjuntosList } from '../features/adjuntos/components/AdjuntosList'
import { apiGet, apiPost } from '../api/http'
import { useAuth } from '../features/auth/context/AuthContext'

type AdjuntoItem = { id:number; nombre_original:string; tamano_bytes:number }

type EscribanoOption = { id:number; apellido:string; nombre:string }

export function AdjuntosPage() {
  const { user } = useAuth()
  const [escribanos, setEscribanos] = useState<EscribanoOption[]>([])
  const [escribanoId, setEscribanoId] = useState<number>(1)
  const [items, setItems] = useState<AdjuntoItem[]>([])
  const [filename, setFilename] = useState('legajo.pdf')
  const [content, setContent] = useState('%PDF-1.4 demo')
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet<{ items: EscribanoOption[] }>('/escribanos').then((data) => {
      setEscribanos(data.items)
      if (data.items[0]) setEscribanoId(data.items[0].id)
    }).catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar escribanos'))
  }, [])

  const loadAdjuntos = async (targetId = escribanoId) => {
    try {
      const data = await apiGet<{ items: AdjuntoItem[] }>(`/adjuntos?escribano_id=${targetId}`)
      setItems(data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar adjuntos')
    }
  }
  useEffect(() => { if (escribanoId) loadAdjuntos(escribanoId) }, [escribanoId])

  const upload = async () => {
    try {
      await apiPost('/adjuntos', { escribano_id: escribanoId, filename, content })
      await loadAdjuntos(escribanoId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir adjunto')
    }
  }

  const download = async (adjuntoId: number) => {
    try {
      let payload: any = { adjunto_id: adjuntoId }
      if (user?.role === 'admin') {
        const password = window.prompt('Ingrese su contraseña para step-up') ?? ''
        const step = await apiPost<{ step_up_token:string }>('/auth/step-up', { username: user.username, password })
        payload.step_up_token = step.step_up_token
      }
      const file = await apiPost<{ filename: string; content: string }>('/adjuntos/download', payload)
      window.alert(`Descarga lógica completada: ${file.filename}\n\n${file.content.substring(0, 80)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar adjunto')
    }
  }

  return (
    <div>
      <PageHeader title="Adjuntos" subtitle="Gestión documental con cifrado AES-256-GCM y step-up en descargas administrativas" />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
        <section style={{ background: '#fff', border: '1px solid #d8e1eb', borderRadius: 14, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Subir PDF</h3>
          <select value={escribanoId} onChange={(e) => setEscribanoId(Number(e.target.value))} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
            {escribanos.map((item) => <option key={item.id} value={item.id}>{item.apellido}, {item.nombre}</option>)}
          </select>
          <input value={filename} onChange={(e) => setFilename(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', minHeight: 140, padding: 10, marginBottom: 10 }} />
          <button onClick={upload}>Subir adjunto</button>
          {error ? <div style={{ color: '#b42318', marginTop: 10 }}>{error}</div> : null}
        </section>
        <section>
          <AdjuntosList items={items} />
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            {items.map((item) => <button key={item.id} onClick={() => download(item.id)} style={{ width: 'fit-content' }}>Descargar {item.nombre_original}</button>)}
          </div>
        </section>
      </div>
    </div>
  )
}
