import type { Escribano } from '../types'

type EscribanoTableProps = {
  items: Escribano[]
  canEdit?: boolean
  onEdit?: (item: Escribano) => void
}

export function EscribanoTable({ items, canEdit = false, onEdit }: EscribanoTableProps) {
  const headers = ['Apellido', 'Nombre', 'DNI', 'Matricula', 'Registro', 'Tipo', 'Localidad', 'Estado', ...(canEdit ? ['Acciones'] : [])]

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
      <thead>
        <tr>
          {headers.map((label) => (
            <th key={label} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #d8e1eb' }}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.id}>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.apellido}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.nombre}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.dni}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.matricula}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.registro}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.tipo_escribano ?? '-'}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.localidad ?? '-'}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{r.estado ?? '-'}</td>
            {canEdit ? (
              <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>
                <button
                  type='button'
                  onClick={() => onEdit?.(r)}
                  style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #bcc57e', background: '#f7f3df', cursor: 'pointer' }}
                >
                  Editar
                </button>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
