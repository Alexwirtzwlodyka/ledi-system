import type { UserItem } from '../types'

export function UsersTable({ items }: { items: UserItem[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr>
          {['Usuario', 'Email', 'Rol', 'Estado'].map((label) => (
            <th key={label} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #d8e1eb' }}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.username}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.email}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.role}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.is_active ? 'Activo' : 'Bloqueado'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
