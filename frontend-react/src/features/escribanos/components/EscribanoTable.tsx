import type { Escribano } from '../types'

export function EscribanoTable({ items }: { items: Escribano[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
      <thead>
        <tr>
          {['Apellido', 'Nombre', 'DNI', 'Matrícula', 'Registro', 'Tipo', 'Localidad', 'Estado'].map((label) => (
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
          </tr>
        ))}
      </tbody>
    </table>
  )
}
