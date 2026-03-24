import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { UsersTable } from '../features/users/components/UsersTable'
import type { UserItem, UserRole } from '../features/users/types'
import { ApiError, apiGet, apiPatch, apiPost } from '../api/http'
import {
  buildCreateUserRequest,
  buildDeleteUserRequest,
  buildUpdateUserRequest,
  buildUsersListRequest,
} from '../features/users/api/usersApi'
import { useAuth } from '../features/auth/context/AuthContext'

type AddressParts = {
  calle: string
  numeracion: string
  barrio: string
}

type UserFormState = {
  username: string
  email: string
  dni: string
  celular: string
  password: string
  role: UserRole
  email_personal: string
  email_laboral: string
  direccion_personal: AddressParts
  direccion_laboral: AddressParts
  escribano_id_vinculado: number | null
}

type EditFormState = {
  email_personal: string
  email_laboral: string
  celular: string
  password: string
  confirmPassword: string
  direccion_personal: AddressParts
  direccion_laboral: AddressParts
  escribano_id_vinculado: number | null
}

type VerificationState = {
  status: 'idle' | 'checking' | 'available' | 'exists' | 'invalid'
  message: string
}

type EscribanoOption = {
  id: number
  apellido: string
  nombre: string
  registro?: string
}

const emptyForm: UserFormState = {
  username: '',
  email: '',
  dni: '',
  celular: '',
  password: '',
  role: 'operador',
  email_personal: '',
  email_laboral: '',
  direccion_personal: emptyAddress(),
  direccion_laboral: emptyAddress(),
  escribano_id_vinculado: null,
}

const emptyEditForm: EditFormState = {
  email_personal: '',
  email_laboral: '',
  celular: '',
  password: '',
  confirmPassword: '',
  direccion_personal: emptyAddress(),
  direccion_laboral: emptyAddress(),
  escribano_id_vinculado: null,
}

const neumorphicCardStyle: CSSProperties = {
  background: '#c8ced4',
  border: '1px solid #aeb6be',
  borderRadius: 22,
  padding: 18,
  boxShadow: 'inset 8px 8px 16px rgba(124, 136, 148, 0.28), inset -10px -10px 18px rgba(245, 247, 249, 0.85), 16px 18px 32px rgba(98, 108, 118, 0.16)',
}

export function UsuariosPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [items, setItems] = useState<UserItem[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [verification, setVerification] = useState<VerificationState>({ status: 'idle', message: 'Verifica el DNI antes de continuar el alta.' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formMessage, setFormMessage] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [escribanos, setEscribanos] = useState<EscribanoOption[]>([])

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
    apiGet<{ items: EscribanoOption[] }>('/escribanos')
      .then((data) => {
        setEscribanos(data.items.filter((item) => (item.registro ?? '').trim() !== ''))
      })
      .catch(() => setEscribanos([]))
  }, [])

  const setCreateField = <K extends keyof UserFormState,>(field: K, value: UserFormState[K]) => {
    if (field === 'dni') {
      const normalized = String(value).replace(/\D+/g, '')
      setForm((current) => ({ ...current, dni: normalized }))
      setVerification({ status: 'idle', message: 'Verifica el DNI antes de continuar el alta.' })
      setFormMessage('')
      setFieldErrors({})
      return
    }

    setForm((current) => ({ ...current, [field]: value }))
    setFormMessage('')
  }

  const setCreateAddressField = (field: 'direccion_personal' | 'direccion_laboral', key: keyof AddressParts, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [key]: value,
      },
    }))
    setFormMessage('')
  }

  const verifyDni = async () => {
    const dni = form.dni.replace(/\D+/g, '')
    if (dni.length < 7) {
      setVerification({ status: 'invalid', message: 'Ingresa un DNI valido antes de verificar.' })
      return
    }

    try {
      setVerification({ status: 'checking', message: 'Verificando existencia del DNI...' })
      const data = await apiGet<{ items: UserItem[]; total: number }>(buildUsersListRequest({ search: dni }).url)
      const match = data.items.find((item) => item.dni === dni)
      if (match) {
        setVerification({ status: 'exists', message: `El DNI ya pertenece al usuario ${match.username}.` })
        return
      }

      setVerification({ status: 'available', message: 'DNI disponible. Ya puedes completar el resto del alta.' })
    } catch (e) {
      setVerification({ status: 'invalid', message: e instanceof Error ? e.message : 'No se pudo verificar el DNI.' })
    }
  }

  const resetCreateForm = () => {
    setForm(emptyForm)
    setVerification({ status: 'idle', message: 'Verifica el DNI antes de continuar el alta.' })
    setFormMessage('')
    setFieldErrors({})
  }

  const create = async () => {
    const normalizedDni = form.dni.replace(/\D+/g, '')
    if (normalizedDni === '') {
      setError('El DNI es obligatorio para crear el usuario.')
      setFieldErrors({ dni: 'Ingresa un DNI valido.' })
      return
    }

    if (verification.status !== 'available') {
      setError('Primero debes verificar que el DNI no exista antes de crear el usuario.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setFieldErrors({})
      const request = buildCreateUserRequest(buildCreatePayload(form))
      await apiPost(request.url, request.body)
      resetCreateForm()
      setFormMessage('Usuario creado correctamente.')
      await load()
    } catch (e) {
      const apiError = normalizeApiError(e)
      setError(apiError.message)
      setFieldErrors(apiError.errors)
    } finally {
      setLoading(false)
    }
  }

  const update = async () => {
    if (!selectedUser) return
    if (editForm.password !== editForm.confirmPassword) {
      setError('La clave y su verificacion no coinciden.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const request = buildUpdateUserRequest({
        user_id: selectedUser.id,
        email_personal: editForm.email_personal,
        email_laboral: editForm.email_laboral,
        celular: editForm.celular,
        password: editForm.password.trim(),
        direccion_personal: formatAddress(editForm.direccion_personal),
        direccion_laboral: formatAddress(editForm.direccion_laboral),
        direccion_personal_calle: editForm.direccion_personal.calle.trim(),
        direccion_personal_numeracion: editForm.direccion_personal.numeracion.trim(),
        direccion_personal_barrio: editForm.direccion_personal.barrio.trim(),
        direccion_laboral_calle: editForm.direccion_laboral.calle.trim(),
        direccion_laboral_numeracion: editForm.direccion_laboral.numeracion.trim(),
        direccion_laboral_barrio: editForm.direccion_laboral.barrio.trim(),
        escribano_id_vinculado: editForm.escribano_id_vinculado,
      })
      await apiPatch(request.url, request.body)
      setEditMessage('Usuario actualizado.')
      setEditForm((current) => ({ ...current, password: '', confirmPassword: '' }))
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (item: UserItem) => {
    const confirmed = window.confirm(`Se eliminara el usuario ${item.username}. Esta accion no se puede deshacer.`)
    if (!confirmed) return

    try {
      setLoading(true)
      setError('')
      const request = buildDeleteUserRequest(item.id)
      await apiPost(request.url, request.body)
      if (selectedUser?.id === item.id) {
        setSelectedUser(null)
        setEditForm(emptyEditForm)
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar usuario')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: UserItem) => {
    if (!isAdmin) return

    setSelectedUser(item)
    setEditForm({
      email_personal: item.email_personal ?? '',
      email_laboral: item.email_laboral ?? '',
      celular: item.celular ?? '',
      password: '',
      confirmPassword: '',
      direccion_personal: parseAddress(item.direccion_personal, item.direccion_personal_calle, item.direccion_personal_numeracion, item.direccion_personal_barrio),
      direccion_laboral: parseAddress(item.direccion_laboral, item.direccion_laboral_calle, item.direccion_laboral_numeracion, item.direccion_laboral_barrio),
      escribano_id_vinculado: item.escribano_id_vinculado ?? null,
    })
    setEditMessage('')
    setError('')
    setFieldErrors({})
  }

  const verificationColor = verification.status === 'exists' || verification.status === 'invalid'
    ? '#b42318'
    : verification.status === 'available'
      ? '#166534'
      : '#5f6f3f'

  const formLocked = verification.status !== 'available'

  return (
    <div>
      <PageHeader title='Usuarios' subtitle='Alta con verificacion por DNI y edicion administrativa acotada' />
      <div style={pageStackStyle}>
        <section style={compactFormCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, color: '#506223' }}>Nuevo usuario</h3>
              <p style={{ margin: '6px 0 0', color: '#6f8050' }}>Primero valida el DNI. El resto del formulario se habilita solo si no existe.</p>
            </div>
          </div>
          {isAdmin ? (
            <>
              <Field label='DNI'>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                  <input value={form.dni} onChange={(e) => setCreateField('dni', e.target.value)} style={compactInputStyle(false)} placeholder='Solo numeros' />
                  <button type='button' onClick={verifyDni} disabled={loading} style={actionButtonStyle('#dce6b1', loading)}>Verificar DNI</button>
                </div>
                <FieldError message={fieldErrors.dni} />
              </Field>
              <div style={{ marginBottom: 12, color: verificationColor, fontWeight: 600 }}>{verification.message}</div>
              <div style={parallelFieldsStyle}>
                <TextField label='Usuario' value={form.username} onChange={(value) => setCreateField('username', value)} disabled={formLocked} error={fieldErrors.username} />
                <Field label='Rol'>
                  <select value={form.role} onChange={(e) => setCreateField('role', e.target.value as UserRole)} disabled={formLocked} style={compactInputStyle(formLocked)}>
                    <option value='operador'>Operador</option>
                    <option value='consulta'>Consulta</option>
                    <option value='admin'>Admin</option>
                  </select>
                </Field>
                <TextField label='Mail de acceso' value={form.email} onChange={(value) => setCreateField('email', value)} disabled={formLocked} type='email' error={fieldErrors.email} />
                <TextField label='Contrasena' value={form.password} onChange={(value) => setCreateField('password', value)} disabled={formLocked} type='password' error={fieldErrors.password} />
                <TextField label='Celular' value={form.celular} onChange={(value) => setCreateField('celular', value)} disabled={formLocked} />
                <TextField label='Mail personal' value={form.email_personal} onChange={(value) => setCreateField('email_personal', value)} disabled={formLocked} type='email' error={fieldErrors.email_personal} />
                <TextField label='Mail laboral' value={form.email_laboral} onChange={(value) => setCreateField('email_laboral', value)} disabled={formLocked} type='email' error={fieldErrors.email_laboral} />
                <WideField>
                  <AddressFields
                    label='Direccion personal'
                    value={form.direccion_personal}
                    onChange={(key, value) => setCreateAddressField('direccion_personal', key, value)}
                    disabled={formLocked}
                  />
                </WideField>
                <WideField>
                  <AddressFields
                    label='Direccion laboral'
                    value={form.direccion_laboral}
                    onChange={(key, value) => setCreateAddressField('direccion_laboral', key, value)}
                    disabled={formLocked}
                  />
                </WideField>
                <WideField>
                  <Field label='Registro vinculado'>
                    <select value={form.escribano_id_vinculado ?? ''} onChange={(e) => setCreateField('escribano_id_vinculado', e.target.value ? Number(e.target.value) : null)} disabled={formLocked} style={compactInputStyle(formLocked)}>
                      <option value=''>Seleccionar escribano/registro</option>
                      {escribanos.map((item) => <option key={item.id} value={item.id}>{item.registro} - {item.apellido}, {item.nombre}</option>)}
                    </select>
                    <FieldError message={fieldErrors.registro_vinculado} />
                  </Field>
                </WideField>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type='button' onClick={create} disabled={loading} style={actionButtonStyle('#c7d48b', loading)}>Crear usuario</button>
                <button type='button' onClick={resetCreateForm} style={actionButtonStyle('#f6f7ee')}>Limpiar</button>
                {formMessage ? <div style={{ color: '#166534', fontWeight: 600 }}>{formMessage}</div> : null}
              </div>
              {error ? <div style={{ color: '#b42318', marginTop: 10 }}>{error}</div> : null}
            </>
          ) : (
            <div style={{ color: '#5e718d' }}>Solo el rol admin puede dar de alta usuarios.</div>
          )}
        </section>
        <section style={recordsCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, color: '#506223' }}>Buscar usuario</h3>
              <p style={{ margin: '6px 0 0', color: '#6f8050' }}>Busca por usuario, DNI, mails, celular, rol o registro y selecciona un usuario para editarlo.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar por usuario, DNI, mails, celular, rol o registro'
              style={{ ...inputStyle(false), marginBottom: 0, maxWidth: 420 }}
            />
            <button type='button' onClick={() => void load(search)} disabled={loading} style={actionButtonStyle('#e6ebc4', loading)}>Buscar</button>
            <button type='button' onClick={() => { setSearch(''); void load('') }} style={actionButtonStyle('#f6f7ee')}>Limpiar</button>
          </div>
          {error ? <div style={{ color: '#b42318', marginBottom: 10 }}>{error}</div> : null}
          <div style={{ overflowX: 'auto' }}>
            <UsersTable items={items} selectedUserId={selectedUser?.id ?? null} canEdit={isAdmin} onEdit={startEdit} onDelete={remove} />
          </div>
        </section>

        {isAdmin ? (
          <section style={{ ...compactFormCardStyle, opacity: selectedUser ? 1 : 0.92 }}>
            <h3 style={{ marginTop: 0, marginBottom: 6, color: '#506223' }}>Editar usuario</h3>
            <div style={{ color: '#6f8050', marginBottom: 12 }}>
              {selectedUser ? `Editando ${selectedUser.username} - DNI ${selectedUser.dni}` : 'Selecciona un usuario de la tabla para editar solo los campos permitidos.'}
            </div>
            <div style={parallelFieldsStyle}>
              <TextField label='Mail personal' value={editForm.email_personal} onChange={(value) => setEditForm((current) => ({ ...current, email_personal: value }))} disabled={!selectedUser} type='email' />
              <TextField label='Mail laboral' value={editForm.email_laboral} onChange={(value) => setEditForm((current) => ({ ...current, email_laboral: value }))} disabled={!selectedUser} type='email' />
              <TextField label='Celular' value={editForm.celular} onChange={(value) => setEditForm((current) => ({ ...current, celular: value }))} disabled={!selectedUser} />
              <TextField label='Clave' value={editForm.password} onChange={(value) => setEditForm((current) => ({ ...current, password: value }))} disabled={!selectedUser} type='password' />
              <TextField label='Verificar clave' value={editForm.confirmPassword} onChange={(value) => setEditForm((current) => ({ ...current, confirmPassword: value }))} disabled={!selectedUser} type='password' />
              <WideField>
                <AddressFields
                  label='Direccion personal'
                  value={editForm.direccion_personal}
                  onChange={(key, value) => setEditForm((current) => ({ ...current, direccion_personal: { ...current.direccion_personal, [key]: value } }))}
                  disabled={!selectedUser}
                />
              </WideField>
              <WideField>
                <AddressFields
                  label='Direccion laboral'
                  value={editForm.direccion_laboral}
                  onChange={(key, value) => setEditForm((current) => ({ ...current, direccion_laboral: { ...current.direccion_laboral, [key]: value } }))}
                  disabled={!selectedUser}
                />
              </WideField>
              <WideField>
                <Field label='Registro vinculado'>
                  <select value={editForm.escribano_id_vinculado ?? ''} onChange={(e) => setEditForm((current) => ({ ...current, escribano_id_vinculado: e.target.value ? Number(e.target.value) : null }))} disabled={!selectedUser} style={compactInputStyle(!selectedUser)}>
                    <option value=''>Seleccionar escribano/registro</option>
                    {escribanos.map((item) => <option key={item.id} value={item.id}>{item.registro} - {item.apellido}, {item.nombre}</option>)}
                  </select>
                </Field>
              </WideField>
            </div>
            {editMessage ? <div style={{ color: '#166534', marginTop: 10, fontWeight: 600 }}>{editMessage}</div> : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type='button' onClick={update} disabled={loading || !selectedUser} style={actionButtonStyle(selectedUser ? '#c7d48b' : '#e3e7d4', loading || !selectedUser)}>Guardar cambios</button>
              <button type='button' onClick={() => { setSelectedUser(null); setEditForm(emptyEditForm); setEditMessage('') }} style={actionButtonStyle('#f6f7ee')}>Cancelar</button>
            </div>
          </section>
        ) : null}
              </div>
            </div>
  )
}

function Field({ label, children, width = '100%' }: { label: string; children: ReactNode; width?: string }) {
  return (
    <label style={{ display: 'grid', gap: 6, marginBottom: 0, width }}>
      <span style={{ color: '#374724', fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  )
}

function WideField({ children }: { children: ReactNode }) {
  return <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>{children}</div>
}

function AddressFields({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: AddressParts
  onChange: (key: keyof AddressParts, value: string) => void
  disabled: boolean
}) {
  return (
    <Field label={label}>
      <div style={addressGridStyle}>
        <input value={value.calle} onChange={(e) => onChange('calle', e.target.value)} disabled={disabled} placeholder='Calle' style={compactInputStyle(disabled)} />
        <input value={value.numeracion} onChange={(e) => onChange('numeracion', e.target.value)} disabled={disabled} placeholder='Numeracion' style={compactInputStyle(disabled)} />
        <input value={value.barrio} onChange={(e) => onChange('barrio', e.target.value)} disabled={disabled} placeholder='Barrio' style={compactInputStyle(disabled)} />
      </div>
    </Field>
  )
}

function TextField({
  label,
  value,
  onChange,
  disabled = false,
  type = 'text',
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  type?: string
  error?: string
}) {
  return (
    <Field label={label}>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} disabled={disabled} style={inputStyle(disabled)} />
      <FieldError message={error} />
    </Field>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <div style={{ color: '#b42318', fontSize: 13, marginTop: 4 }}>{message}</div>
}

function inputStyle(disabled: boolean): CSSProperties {
  return {
    width: '100%',
    padding: '11px 12px',
    marginBottom: 0,
    borderRadius: 12,
    border: '1px solid #c7d09a',
    background: disabled ? '#eef0e5' : '#fcfdf7',
    color: '#334015',
    boxSizing: 'border-box',
  }
}

function compactInputStyle(disabled: boolean): CSSProperties {
  return {
    ...inputStyle(disabled),
    width: '100%',
    maxWidth: '100%',
  }
}

function actionButtonStyle(background: string, disabled = false): CSSProperties {
  return {
    padding: '11px 14px',
    borderRadius: 12,
    border: '1px solid #b6c273',
    background,
    color: '#425019',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700,
    opacity: disabled ? 0.7 : 1,
  }
}

function emptyAddress(): AddressParts {
  return { calle: '', numeracion: '', barrio: '' }
}

function formatAddress(value: AddressParts): string {
  const parts = [
    `Calle: ${value.calle.trim()}`,
    `Numeracion: ${value.numeracion.trim()}`,
    `Barrio: ${value.barrio.trim()}`,
  ].filter((part) => !part.endsWith(': '))

  return parts.join(' | ')
}

function parseAddress(value?: string, calle?: string, numeracion?: string, barrio?: string): AddressParts {
  if ((calle ?? '').trim() !== '' || (numeracion ?? '').trim() !== '' || (barrio ?? '').trim() !== '') {
    return {
      calle: (calle ?? '').trim(),
      numeracion: (numeracion ?? '').trim(),
      barrio: (barrio ?? '').trim(),
    }
  }

  const raw = (value ?? '').trim()
  if (!raw) return emptyAddress()

  const pipeParts = raw.split('|').map((part) => part.trim())
  if (pipeParts.length === 3) {
    return {
      calle: pipeParts[0].replace(/^Calle:\s*/i, ''),
      numeracion: pipeParts[1].replace(/^(Numeracion|Nro):\s*/i, ''),
      barrio: pipeParts[2].replace(/^Barrio:\s*/i, ''),
    }
  }

  return { calle: raw, numeracion: '', barrio: '' }
}

function buildCreatePayload(form: UserFormState) {
  return {
    username: form.username.trim(),
    email: form.email.trim(),
    dni: form.dni.replace(/\D+/g, '').trim(),
    celular: form.celular.trim(),
    password: form.password,
    role: form.role,
    email_personal: form.email_personal.trim(),
    email_laboral: form.email_laboral.trim(),
    escribano_id_vinculado: form.escribano_id_vinculado,
    direccion_personal: formatAddress(form.direccion_personal),
    direccion_laboral: formatAddress(form.direccion_laboral),
    direccion_personal_calle: form.direccion_personal.calle.trim(),
    direccion_personal_numeracion: form.direccion_personal.numeracion.trim(),
    direccion_personal_barrio: form.direccion_personal.barrio.trim(),
    direccion_laboral_calle: form.direccion_laboral.calle.trim(),
    direccion_laboral_numeracion: form.direccion_laboral.numeracion.trim(),
    direccion_laboral_barrio: form.direccion_laboral.barrio.trim(),
  }
}

function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof Error) return new ApiError(error.message)
  return new ApiError('No se pudo crear usuario')
}

const parallelFieldsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
  alignItems: 'start',
}

const addressGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
}

const pageStackStyle: CSSProperties = {
  display: 'grid',
  gap: '5mm',
  alignItems: 'start',
  justifyItems: 'center',
}

const recordsCardStyle: CSSProperties = {
  background: '#c8ced4',
  border: '1px solid #aeb6be',
  borderRadius: 18,
  padding: 16,
  boxShadow: '0 16px 28px rgba(98, 108, 118, 0.16)',
  width: '100%',
  maxWidth: '1100px',
  minWidth: 0,
}

const compactFormCardStyle: CSSProperties = {
  ...neumorphicCardStyle,
  width: '100%',
  maxWidth: '1100px',
  minWidth: 0,
}
