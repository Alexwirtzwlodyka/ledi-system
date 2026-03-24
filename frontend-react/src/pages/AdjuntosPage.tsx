import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { PageHeader } from '../components/PageHeader'
import { AdjuntosList } from '../features/adjuntos/components/AdjuntosList'
import { apiGet, apiPatch, apiPost } from '../api/http'
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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const editInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    apiGet<{ items: EscribanoOption[] }>('/escribanos').then((data) => {
      setEscribanos(data.items)
      if (data.items[0]) setEscribanoId(data.items[0].id)
    }).catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar escribanos'))
  }, [])

  useEffect(() => () => {
    if (viewerUrl) URL.revokeObjectURL(viewerUrl)
  }, [viewerUrl])

  const loadAdjuntos = async (targetId = escribanoId) => {
    try {
      const data = await apiGet<{ items: AdjuntoItem[] }>(`/adjuntos?escribano_id=${targetId}`)
      setItems(data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar adjuntos')
    }
  }
  useEffect(() => { if (escribanoId) void loadAdjuntos(escribanoId) }, [escribanoId])

  const upload = async () => {
    if (!selectedFile) {
      setError('Seleccione un PDF antes de subirlo')
      return
    }

    try {
      setUploading(true)
      setError('')
      const content = await fileToBase64(selectedFile)

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

  const downloadOrFetch = async (adjuntoId: number) => {
    const payload: Record<string, unknown> = { adjunto_id: adjuntoId }
    if (user?.role === 'admin') {
      const password = window.prompt('Ingrese su contrasena para step-up') ?? ''
      const step = await apiPost<{ step_up_token:string }>('/auth/step-up', { username: user.username, password })
      payload.step_up_token = step.step_up_token
    }
    return apiPost<DownloadAdjuntoResponse>('/adjuntos/download', payload)
  }

  const download = async (adjuntoId: number) => {
    try {
      setError('')
      const file = await downloadOrFetch(adjuntoId)
      const blob = buildPdfBlob(file)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar adjunto')
    }
  }

  const viewPdf = async (adjuntoId: number) => {
    try {
      setError('')
      const file = await downloadOrFetch(adjuntoId)
      const blob = buildPdfBlob(file)
      if (viewerUrl) URL.revokeObjectURL(viewerUrl)
      const url = URL.createObjectURL(blob)
      setViewerUrl(url)
      setViewerTitle(file.filename)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir el PDF')
    }
  }

  const beginEdit = (item: AdjuntoItem) => {
    setEditingId(item.id)
    if (editInputRef.current) editInputRef.current.value = ''
    editInputRef.current?.click()
  }

  const replacePdf = async (file: File | null) => {
    if (!file || editingId === null) return

    try {
      setError('')
      const content = await fileToBase64(file)
      await apiPatch('/adjuntos', {
        adjunto_id: editingId,
        filename: file.name,
        content,
        content_encoding: 'base64',
      })
      setEditingId(null)
      if (editInputRef.current) editInputRef.current.value = ''
      await loadAdjuntos(escribanoId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo editar el PDF')
    }
  }

  return (
    <div>
      <PageHeader title='Adjuntos' subtitle='Gestion documental con cifrado AES-256-GCM y acciones directas sobre cada PDF existente' />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
        <section style={{ background: '#c8ced4', border: '1px solid #aeb6be', borderRadius: 14, padding: 16, boxShadow: '0 16px 28px rgba(98, 108, 118, 0.16)' }}>
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
          <input
            ref={editInputRef}
            type='file'
            accept='application/pdf,.pdf'
            onChange={(e) => void replacePdf(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()} style={{ marginBottom: 10 }}>
            Buscar PDF
          </button>
          <div style={{ marginBottom: 10, color: '#5e718d' }}>
            {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : 'Ningun archivo seleccionado'}
          </div>
          <button onClick={upload} disabled={!selectedFile || uploading}>
            {uploading ? 'Subiendo...' : 'Subir adjunto'}
          </button>
          {error ? <div style={{ color: '#b42318', marginTop: 10 }}>{error}</div> : null}
        </section>
        <section style={{ display: 'grid', gap: 16 }}>
          <AdjuntosList items={items} onDownload={download} onView={viewPdf} onEdit={beginEdit} />
          {viewerUrl ? (
            <div style={viewerCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0 }}>Vista PDF</h3>
                  <div style={{ color: '#5e718d', marginTop: 4 }}>{viewerTitle}</div>
                </div>
                <button type='button' onClick={() => {
                  URL.revokeObjectURL(viewerUrl)
                  setViewerUrl(null)
                  setViewerTitle('')
                }}>
                  Cerrar visor
                </button>
              </div>
              <iframe title={viewerTitle} src={viewerUrl} style={{ width: '100%', minHeight: 620, border: '1px solid #d8e1eb', borderRadius: 12, background: '#fff' }} />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function buildPdfBlob(file: DownloadAdjuntoResponse): Blob {
  if (file.content_encoding === 'base64') {
    const binary = atob(file.content)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new Blob([bytes], { type: file.mime_type ?? 'application/pdf' })
  }

  return new Blob([file.content], { type: file.mime_type ?? 'application/pdf' })
}

const viewerCardStyle: CSSProperties = {
  background: '#c8ced4',
  border: '1px solid #aeb6be',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 16px 28px rgba(98, 108, 118, 0.16)',
}
