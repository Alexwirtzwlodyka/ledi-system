import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { UsersTable } from '../features/users/components/UsersTable'
import type { UserItem, UserRole } from '../features/users/types'
import { apiGet, apiPost } from '../api/http'

export function UsuariosPage() {
  const [items, setItems] = useState<UserItem[]>([])
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'operador' as UserRole })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await apiGet<{ items: UserItem[] }>('/users')
      setItems(data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar usuarios')
    }
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      setError('')
      await apiPost('/users', form)
      setForm({ username: '', email: '', password: '', role: 'operador' })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear usuario')
    }
  }

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Administración de credenciales, roles y estados" />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
        <section style={{ background: '#fff', border: '1px solid #d8e1eb', borderRadius: 14, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Nuevo usuario</h3>
          <input placeholder='Username' value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input placeholder='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input placeholder='Contraseña' type='password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
            <option value='operador'>Operador</option>
            <option value='consulta'>Consulta</option>
            <option value='admin'>Admin</option>
          </select>
          {error ? <div style={{ color: '#b42318', marginBottom: 10 }}>{error}</div> : null}
          <button onClick={create}>Crear usuario</button>
        </section>
        <section>
          <UsersTable items={items} />
        </section>
      </div>
    </div>
  )
}
