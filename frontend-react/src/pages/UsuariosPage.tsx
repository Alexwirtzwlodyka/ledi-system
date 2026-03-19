import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { UsersTable } from '../features/users/components/UsersTable'
import type { UserItem, UserRole } from '../features/users/types'
import { apiGet, apiPatch, apiPost } from '../api/http'
import {
  buildCreateUserRequest,
  buildDeleteUserRequest,
  buildUpdateUserRequest,
  buildUsersListRequest,
} from '../features/users/api/usersApi'

type UserFormState = {
  username: string
  email: string
  celular: string
  password: string
  role: UserRole
  is_active: boolean
}

const emptyForm: UserFormState = {
  username: '',
  email: '',
  celular: '',
  password: '',
  role: 'operador',
  is_active: true,
}

const cardStyle = {
  background: '#fff',
  border: '1px solid #d8e1eb',
  borderRadius: 14,
  padding: 16,
}

const inputStyle = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
  borderRadius: 10,
  border: '1px solid #cfd8c2',
}

export function UsuariosPage() {
  const [items, setItems] = useState<UserItem[]>([])
  const [search, setSearch] = useState('')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async (nextSearch = search) => {
    try {
      setError('')
      const request = buildUsersListRequest({ search: nextSearch })
      const data = await apiGet<{ items: UserItem[]; total: number }>(request.url)
      setItems(data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar usuarios')
    }
  }

  useEffect(() => {
    void load('')
  }, [])

  const resetForm = () => {
    setEditingUserId(null)
    setForm(emptyForm)
  }

  const create = async () => {
    try {
      setLoading(true)
      setError('')
      const request = buildCreateUserRequest(form)
      await apiPost(request.url, request.body)
      resetForm()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const update = async () => {
    if (editingUserId === null) return

    try {
      setLoading(true)
      setError('')
      const request = buildUpdateUserRequest({
        user_id: editingUserId,
        email: form.email,
        celular: form.celular,
        password: form.password,
        role: form.role,
        is_active: form.is_active,
      })
      await apiPatch(request.url, request.body)
      resetForm()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (item: UserItem) => {
    const confirmed = window.confirm(`Se eliminará el usuario ${item.username}. Esta acción no se puede deshacer.`)
    if (!confirmed) return

    try {
      setLoading(true)
      setError('')
      const request = buildDeleteUserRequest(item.id)
      await apiPost(request.url, request.body)
      if (editingUserId === item.id) {
        resetForm()
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar usuario')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: UserItem) => {
    setEditingUserId(item.id)
    setForm({
      username: item.username,
      email: item.email,
      celular: item.celular ?? '',
      password: '',
      role: item.role,
      is_active: item.is_active,
    })
    setError('')
  }

  const title = editingUserId === null ? 'Nuevo usuario' : `Editar usuario: ${form.username}`

  return (
    <div>
      <PageHeader title='Usuarios' subtitle='Administración de credenciales, búsqueda y mantenimiento de cuentas' />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
        <section style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>{title}</h3>
          <input
            placeholder='Usuario'
            value={form.username}
            disabled={editingUserId !== null}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={{ ...inputStyle, background: editingUserId !== null ? '#f5f5f5' : '#fff' }}
          />
          <input
            placeholder='Mail'
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder='Celular'
            value={form.celular}
            onChange={(e) => setForm({ ...form, celular: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder={editingUserId === null ? 'Contraseña' : 'Nueva contraseña (opcional)'}
            type='password'
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
          />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} style={inputStyle}>
            <option value='operador'>Operador</option>
            <option value='consulta'>Consulta</option>
            <option value='admin'>Admin</option>
          </select>
          {editingUserId !== null ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input
                type='checkbox'
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Usuario activo
            </label>
          ) : null}
          {error ? <div style={{ color: '#b42318', marginBottom: 10 }}>{error}</div> : null}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type='button' onClick={editingUserId === null ? create : update} disabled={loading}>
              {editingUserId === null ? 'Crear usuario' : 'Guardar cambios'}
            </button>
            {editingUserId !== null ? <button type='button' onClick={resetForm}>Cancelar</button> : null}
          </div>
        </section>
        <section>
          <div style={{ ...cardStyle, marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar por usuario, mail, celular o rol'
              style={{ ...inputStyle, marginBottom: 0, maxWidth: 420 }}
            />
            <button type='button' onClick={() => load(search)} disabled={loading}>Buscar</button>
            <button
              type='button'
              onClick={() => {
                setSearch('')
                void load('')
              }}
            >
              Limpiar
            </button>
          </div>
          <UsersTable items={items} editingUserId={editingUserId} onEdit={startEdit} onDelete={remove} />
        </section>
      </div>
    </div>
  )
}
