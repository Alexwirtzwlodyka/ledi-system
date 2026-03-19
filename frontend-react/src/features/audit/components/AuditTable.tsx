export interface AuditItem { id: number; action: string; target_type: string; target_id: number | string; created_at: string }

export function AuditTable({ items }: { items: AuditItem[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr>
          {['Acción', 'Tipo', 'Objetivo', 'Fecha'].map((label) => (
            <th key={label} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #d8e1eb' }}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.action}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.target_type}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.target_id}</td>
            <td style={{ padding: 12, borderBottom: '1px solid #edf2f7' }}>{item.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
