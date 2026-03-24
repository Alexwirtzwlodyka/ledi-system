import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { PageHeader } from '../components/PageHeader'
import { apiGet, apiPost } from '../api/http'
import { useAuth } from '../features/auth/context/AuthContext'

type RegistroOption = { id: number; apellido: string; nombre: string; registro?: string }
type LibroItem = { id: number; registro: string; descripcion: string; nombre_original: string; tamano_bytes: number }
type DownloadLibroResponse = { filename: string; mime_type?: string; content: string; content_encoding?: 'plain' | 'base64' }

export function LibrosPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [registros, setRegistros] = useState<RegistroOption[]>([])
  const [registro, setRegistro] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [items, setItems] = useState<LibroItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    apiGet<{ items: RegistroOption[] }>('/escribanos')
      .then((data) => {
        const onlyWithRegistro = data.items.filter((item) => (item.registro ?? '').trim() !== '')
        setRegistros(onlyWithRegistro)
        if (onlyWithRegistro[0]) setRegistro(onlyWithRegistro[0].registro ?? '')
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar registros'))
  }, [])

  useEffect(() => () => {
    if (viewerUrl) URL.revokeObjectURL(viewerUrl)
  }, [viewerUrl])

  const filteredRegistros = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return registros
    return registros.filter((item) => (item.registro ?? '').toLowerCase().includes(needle))
  }, [registros, search])

  const loadLibros = async (targetRegistro = registro) => {
    if (!targetRegistro) {
      setItems([])
      return
    }

    try {
      const data = await apiGet<{ items: LibroItem[] }>(`/libros?registro=${encodeURIComponent(targetRegistro)}`)
      setItems(data.items)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar libros')
    }
  }

  useEffect(() => {
    void loadLibros(registro)
  }, [registro])

  const upload = async () => {
    if (!registro) {
      setError('Selecciona un registro')
      return
    }
    if (!selectedFile) {
      setError('Seleccione un PDF antes de subirlo')
      return
    }

    try {
      setUploading(true)
      setError('')
      const content = await fileToBase64(selectedFile)
      await apiPost('/libros', {
        registro,
        descripcion,
        filename: selectedFile.name,
        content,
        content_encoding: 'base64',
      })
      setDescripcion('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadLibros(registro)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el libro')
    } finally {
      setUploading(false)
    }
  }

  const downloadOrFetch = async (libroId: number) => {
    const payload: Record<string, unknown> = { libro_id: libroId }
    if (user?.role === 'admin') {
      const password = window.prompt('Ingrese su contrasena para step-up') ?? ''
      const step = await apiPost<{ step_up_token: string }>('/auth/step-up', { username: user.username, password })
      payload.step_up_token = step.step_up_token
    }
    return apiPost<DownloadLibroResponse>('/libros/download', payload)
  }

  const download = async (libroId: number) => {
    try {
      const file = await downloadOrFetch(libroId)
      const blob = buildPdfBlob(file)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar el libro')
    }
  }

  const viewPdf = async (libroId: number) => {
    try {
      const file = await downloadOrFetch(libroId)
      const blob = buildPdfBlob(file)
      if (viewerUrl) URL.revokeObjectURL(viewerUrl)
      const url = URL.createObjectURL(blob)
      setViewerUrl(url)
      setViewerTitle(file.filename)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo abrir el PDF')
    }
  }

  return (
    <div>
      <PageHeader title='Libros' subtitle='Carga y consulta de PDFs vinculados por registro' />
      <div style={pageStackStyle}>
        <section style={cardStyle}>
          <h3 style={{ marginTop: 0, color: '#506223' }}>Nuevo libro</h3>
          <div style={formGridStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Buscar registro</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Filtrar registros' style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span style={labelStyle}>Registro</span>
              <select value={registro} onChange={(e) => setRegistro(e.target.value)} style={inputStyle}>
                <option value=''>Seleccionar registro</option>
                {filteredRegistros.map((item) => (
                  <option key={item.id} value={item.registro ?? ''}>
                    {item.registro} - {item.apellido}, {item.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <span style={labelStyle}>Descripcion</span>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} placeholder='Descripcion del libro' style={textareaStyle} />
            </label>
          </div>
          <input ref={fileInputRef} type='file' accept='application/pdf,.pdf' onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            <button type='button' onClick={() => fileInputRef.current?.click()} style={buttonStyle('#e6ebc4')}>
              Buscar PDF
            </button>
            <button type='button' onClick={upload} disabled={uploading || !selectedFile || !registro} style={buttonStyle(uploading || !selectedFile || !registro ? '#e3e7d4' : '#c7d48b', uploading || !selectedFile || !registro)}>
              {uploading ? 'Subiendo...' : 'Guardar libro'}
            </button>
            <span style={{ color: '#6f8050' }}>{selectedFile ? selectedFile.name : 'Ningun archivo seleccionado'}</span>
          </div>
          {error ? <div style={{ color: '#b42318', marginTop: 10 }}>{error}</div> : null}
        </section>

        <section style={listCardStyle}>
          <h3 style={{ marginTop: 0, color: '#506223' }}>Libros cargados</h3>
          <div style={{ color: '#6f8050', marginBottom: 12 }}>{registro ? `Registro seleccionado: ${registro}` : 'Selecciona un registro para ver sus libros.'}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((item) => (
              <div key={item.id} style={itemCardStyle}>
                <div>
                  <strong style={{ color: '#425019' }}>{item.nombre_original}</strong>
                  <div style={{ color: '#5f6f3f', marginTop: 4 }}>Descripcion: {item.descripcion || '-'}</div>
                  <div style={{ color: '#7b8753', marginTop: 4 }}>{item.tamano_bytes} bytes</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type='button' onClick={() => void viewPdf(item.id)} style={buttonStyle('#edf0cf')}>Ver PDF</button>
                  <button type='button' onClick={() => void download(item.id)} style={buttonStyle('#d7df8d')}>Descargar PDF</button>
                </div>
              </div>
            ))}
            {items.length === 0 ? <div style={{ color: '#6f8050' }}>No hay libros cargados para este registro.</div> : null}
          </div>
        </section>

        {viewerUrl ? (
          <section style={listCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, color: '#506223' }}>Vista PDF</h3>
                <div style={{ color: '#6f8050', marginTop: 4 }}>{viewerTitle}</div>
              </div>
              <button type='button' onClick={() => {
                URL.revokeObjectURL(viewerUrl)
                setViewerUrl(null)
                setViewerTitle('')
              }} style={buttonStyle('#f6f7ee')}>
                Cerrar visor
              </button>
            </div>
            <iframe title={viewerTitle} src={viewerUrl} style={{ width: '100%', minHeight: 620, border: '1px solid #b6bec7', borderRadius: 12, background: '#fff' }} />
          </section>
        ) : null}
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

function buildPdfBlob(file: DownloadLibroResponse): Blob {
  if (file.content_encoding === 'base64') {
    const binary = atob(file.content)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new Blob([bytes], { type: file.mime_type ?? 'application/pdf' })
  }

  return new Blob([file.content], { type: file.mime_type ?? 'application/pdf' })
}

function buttonStyle(background: string, disabled = false): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #b6c273',
    background,
    color: '#425019',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
  }
}

const pageStackStyle: CSSProperties = {
  display: 'grid',
  gap: '5mm',
  justifyItems: 'center',
}

const cardStyle: CSSProperties = {
  background: '#c8ced4',
  border: '1px solid #aeb6be',
  borderRadius: 22,
  padding: 18,
  boxShadow: 'inset 8px 8px 16px rgba(124, 136, 148, 0.28), inset -10px -10px 18px rgba(245, 247, 249, 0.85), 16px 18px 32px rgba(98, 108, 118, 0.16)',
  width: '100%',
  maxWidth: '1100px',
}

const listCardStyle: CSSProperties = {
  background: '#c8ced4',
  border: '1px solid #aeb6be',
  borderRadius: 18,
  padding: 16,
  boxShadow: '0 16px 28px rgba(98, 108, 118, 0.16)',
  width: '100%',
  maxWidth: '1100px',
}

const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
}

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
}

const labelStyle: CSSProperties = {
  color: '#506223',
  fontWeight: 700,
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 12,
  border: '1px solid #c7d09a',
  background: '#fcfdf7',
  color: '#334015',
  boxSizing: 'border-box',
}

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
}

const itemCardStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  background: '#c8ced4',
  border: '1px solid #aeb6be',
  borderRadius: 14,
  padding: 14,
}
