import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { AdjuntosList } from '../features/adjuntos/components/AdjuntosList'
import { apiGet, apiPost } from '../api/http'
import { useAuth } from '../features/auth/context/AuthContext'

type AdjuntoItem = { id:number; nombre_original:string; tamano_bytes:number }
type DownloadAdjuntoResponse = { filename: string; mime_type?: string; content: string; content_encoding?: 'plain' | 'base64' }

type EscribanoOption = { id:number; apellido:string; nombre:string }

export function AdjuntosPage() {
  const { user } = useAuth()
  const [escribanos, setEscribanos] = useState<EscribanoOption[]>([])
  const [escribanoId, setEscribanoId] = useState<number>(1)
  const [items, setItems] = useState<AdjuntoItem[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    if (!selectedFile) {
      setError('Seleccione un PDF antes de subirlo')
      return
    }

    try {
      setUploading(true)
      setError('')
      const buffer = await selectedFile.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (const byte of bytes) binary += String.fromCharCode(byte)
      const content = btoa(binary)

      await apiPost('/adjuntos', {
        escribano_id: escribanoId,
        filename: selectedFile.name,
        content,
        content_encoding: 'base64',
      })

      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadAdjuntos(escribanoId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir adjunto')
    } finally {
      setUploading(false)
    }
  }

  const download = async (adjuntoId: number) => {
    try {
      setError('')
      const payload: Record<string, unknown> = { adjunto_id: adjuntoId }
      if (user?.role === 'admin') {
        const password = window.prompt('Ingrese su contraseña para step-up') ?? ''
        const step = await apiPost<{ step_up_token:string }>('/auth/step-up', { username: user.username, password })
        payload.step_up_token = step.step_up_token
      }
      const file = await apiPost<DownloadAdjuntoResponse>('/adjuntos/download', payload)

      if (file.content_encoding === 'base64') {
        const binary = atob(file.content)
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
        const blob = new Blob([bytes], { type: file.mime_type ?? 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.filename
        link.click()
        URL.revokeObjectURL(url)
        return
      }

      window.alert(`Descarga lógica completada: ${file.filename}\n\n${file.content.substring(0, 80)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar adjunto')
    }
  }

  return (
    <div>
      <PageHeader title='Adjuntos' subtitle='Gestión documental con cifrado AES-256-GCM y step-up en descargas administrativas' />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
        <section style={{ background: '#fff', border: '1px solid #d8e1eb', borderRadius: 14, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Subir PDF</h3>
          <select value={escribanoId} onChange={(e) => setEscribanoId(Number(e.target.value))} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
            {escribanos.map((item) => <option key={item.id} value={item.id}>{item.apellido}, {item.nombre}</option>)}
          </select>
          <input
            ref={fileInputRef}
            type='file'
            accept='application/pdf,.pdf'
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()} style={{ marginBottom: 10 }}>
            Buscar PDF
          </button>
          <div style={{ marginBottom: 10, color: '#5e718d' }}>
            {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : 'Ningún archivo seleccionado'}
          </div>
          <button onClick={upload} disabled={!selectedFile || uploading}>
            {uploading ? 'Subiendo...' : 'Subir adjunto'}
          </button>
          {error ? <div style={{ color: '#b42318', marginTop: 10 }}>{error}</div> : null}
        </section>
        <section>
          <AdjuntosList items={items} onDownload={download} />
        </section>
      </div>
    </div>
  )
}
