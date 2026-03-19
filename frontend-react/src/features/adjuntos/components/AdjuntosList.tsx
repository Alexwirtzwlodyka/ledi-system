import { lediTheme } from '../../../theme'

export interface AdjuntoItem {
  id: number
  nombre_original: string
  tamano_bytes: number
}

export function AdjuntosList({ items, onDownload }: { items: AdjuntoItem[]; onDownload: (adjuntoId: number) => void }) {
  return (
    <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
      {items.map((item) => (
        <li
          key={item.id}
          style={{
            background: lediTheme.surface,
            padding: 14,
            border: `1px solid ${lediTheme.border}`,
            borderRadius: 12,
            boxShadow: '0 10px 18px rgba(91, 111, 46, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <strong style={{ color: lediTheme.title }}>{item.nombre_original}</strong>
            <div style={{ color: lediTheme.textMuted, marginTop: 4 }}>{item.tamano_bytes} bytes</div>
          </div>
          <button
            onClick={() => onDownload(item.id)}
            style={{
              marginLeft: 'auto',
              padding: '10px 14px',
              borderRadius: 10,
              border: `1px solid ${lediTheme.border}`,
              background: '#d7df8d',
              color: lediTheme.title,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Descargar PDF
          </button>
        </li>
      ))}
    </ul>
  )
}
