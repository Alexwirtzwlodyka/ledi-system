export interface AdjuntoItem {
  id: number
  nombre_original: string
  tamano_bytes: number
}

export function AdjuntosList({ items }: { items: AdjuntoItem[] }) {
  return (
    <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
      {items.map((item) => (
        <li key={item.id} style={{ background: '#fff', padding: 12, border: '1px solid #d8e1eb', borderRadius: 10 }}>
          <strong>{item.nombre_original}</strong>
          <div style={{ color: '#5e718d', marginTop: 4 }}>{item.tamano_bytes} bytes</div>
        </li>
      ))}
    </ul>
  )
}
