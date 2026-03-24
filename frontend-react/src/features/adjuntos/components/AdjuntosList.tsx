import { ruellTheme } from '../../../theme'

export interface AdjuntoItem {
  id: number
  nombre_original: string
  tamano_bytes: number
}

type AdjuntosListProps = {
  items: AdjuntoItem[]
  onDownload: (adjuntoId: number) => void
  onView: (adjuntoId: number) => void
  onEdit: (item: AdjuntoItem) => void
}

export function AdjuntosList({ items, onDownload, onView, onEdit }: AdjuntosListProps) {
  return (
    <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
      {items.map((item) => (
        <li
          key={item.id}
          style={{
            background: ruellTheme.surface,
            padding: 14,
            border: `1px solid ${ruellTheme.border}`,
            borderRadius: 12,
            boxShadow: '0 10px 18px rgba(91, 111, 46, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ color: ruellTheme.title }}>{item.nombre_original}</strong>
            <div style={{ color: ruellTheme.textMuted, marginTop: 4 }}>{item.tamano_bytes} bytes</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <button onClick={() => onView(item.id)} style={buttonStyle('#edf0cf')}>
              Ver PDF
            </button>
            <button onClick={() => onEdit(item)} style={buttonStyle('#f6e5b8')}>
              Editar PDF
            </button>
            <button onClick={() => onDownload(item.id)} style={buttonStyle('#d7df8d')}>
              Descargar PDF
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function buttonStyle(background: string) {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${ruellTheme.border}`,
    background,
    color: ruellTheme.title,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  }
}
