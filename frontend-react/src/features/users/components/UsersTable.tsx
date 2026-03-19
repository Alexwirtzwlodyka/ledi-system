import type { UserItem } from '../types'

const cellStyle = {
  padding: 12,
  borderBottom: '1px solid #edf2f7',
  verticalAlign: 'top' as const,
}

const actionButtonStyle = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #c5d3b3',
  background: '#f8f4d8',
  color: '#374724',
  cursor: 'pointer',
}

interface UsersTableProps {
  items: UserItem[]
  editingUserId: number | null
  onEdit: (item: UserItem) => void
  onDelete: (item: UserItem) => void
}

export function UsersTable({ items, editingUserId, onEdit, onDelete }: UsersTableProps) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
      <thead>
        <tr>
          {['Usuario', 'Mail', 'Celular', 'Rol', 'Estado', 'Acciones'].map((label) => (
            <th key={label} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #d8e1eb', background: '#f3f7eb' }}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td style={cellStyle}>
              <strong>{item.username}</strong>
              {editingUserId === item.id ? <div style={{ marginTop: 4, color: '#6b7280', fontSize: 12 }}>Editando</div> : null}
            </td>
            <td style={cellStyle}>{item.email}</td>
            <td style={cellStyle}>{item.celular || '-'}</td>
            <td style={cellStyle}>{item.role}</td>
            <td style={cellStyle}>{item.is_active ? 'Activo' : 'Inactivo'}</td>
            <td style={cellStyle}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type='button' onClick={() => onEdit(item)} style={actionButtonStyle}>Editar</button>
                <button
                  type='button'
                  onClick={() => onDelete(item)}
                  style={{ ...actionButtonStyle, borderColor: '#d9a6a6', background: '#fff1f1', color: '#8f1f1f' }}
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
        {items.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ ...cellStyle, textAlign: 'center', color: '#6b7280' }}>
              No se encontraron usuarios con ese criterio.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  )
}
