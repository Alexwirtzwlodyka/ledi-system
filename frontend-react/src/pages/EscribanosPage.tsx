import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { EscribanoTable } from '../features/escribanos/components/EscribanoTable'
import type { Escribano } from '../features/escribanos/types'
import { apiGet, apiPatch, apiPost } from '../api/http'
import { buildEscribanosQuery } from '../features/escribanos/api/escribanosApi'
import { useAuth } from '../features/auth/context/AuthContext'

type AddressParts = {
  calle: string
  numeracion: string
  barrio: string
}

type CreateFormState = {
  apellido: string
  nombre: string
  dni: string
  matricula: string
  localidad: string
  email_personal: string
  email_laboral: string
  telefono: string
  direccion_domicilio: AddressParts
  direccion_estudio: AddressParts
  fecha_nacimiento: string
  fecha_egresado: string
  fecha_matriculado: string
}

type EditFormState = {
  email_personal: string
  email_laboral: string
  telefono: string
  direccion_domicilio: AddressParts
  direccion_estudio: AddressParts
  localidad: string
}

type VerificationState = {
  status: 'idle' | 'checking' | 'available' | 'exists' | 'invalid'
  message: string
}

const emptyCreateForm: CreateFormState = {
  apellido: '',
  nombre: '',
  dni: '',
  matricula: '',
  localidad: '',
  email_personal: '',
  email_laboral: '',
  telefono: '',
  direccion_domicilio: emptyAddress(),
  direccion_estudio: emptyAddress(),
  fecha_nacimiento: '',
  fecha_egresado: '',
  fecha_matriculado: '',
}

const emptyEditForm: EditFormState = {
  email_personal: '',
  email_laboral: '',
  telefono: '',
  direccion_domicilio: emptyAddress(),
  direccion_estudio: emptyAddress(),
  localidad: '',
}

const neumorphicCardStyle: CSSProperties = {
  background: '#c8ced4',
  border: '1px solid #aeb6be',
  borderRadius: 22,
  padding: 18,
  boxShadow: 'inset 8px 8px 16px rgba(124, 136, 148, 0.28), inset -10px -10px 18px rgba(245, 247, 249, 0.85), 16px 18px 32px rgba(98, 108, 118, 0.16)',
}

export function EscribanosPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [items, setItems] = useState<Escribano[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<CreateFormState>(emptyCreateForm)
  const [verification, setVerification] = useState<VerificationState>({ status: 'idle', message: 'Verifica el DNI antes de cargar el resto de los datos.' })
  const [pageError, setPageError] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [selected, setSelected] = useState<Escribano | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm)
  const [editMessage, setEditMessage] = useState('')
  const [editError, setEditError] = useState('')

  const load = async (nextSearch = search) => {
    try {
      const data = await apiGet<{ items: Escribano[]; total: number }>(buildEscribanosQuery({ search: nextSearch }))
      setItems(data.items)
      setPageError('')
    } catch (e) {
      setPageError(e instanceof Error ? e.message : 'No se pudo cargar escribanos')
    }
  }

  useEffect(() => {
    void load('')
  }, [])

  const setCreateField = <K extends keyof CreateFormState,>(field: K, value: CreateFormState[K]) => {
    if (field === 'dni') {
      const normalized = String(value).replace(/\D+/g, '')
      setForm((current) => ({ ...current, dni: normalized }))
      setVerification({ status: 'idle', message: 'Verifica el DNI antes de cargar el resto de los datos.' })
      setFormMessage('')
      return
    }

    setForm((current) => ({ ...current, [field]: value }))
    setFormMessage('')
  }

  const setCreateAddressField = (field: 'direccion_domicilio' | 'direccion_estudio', key: keyof AddressParts, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [key]: value,
      },
    }))
    setFormMessage('')
  }

  const setEditAddressField = (field: 'direccion_domicilio' | 'direccion_estudio', key: keyof AddressParts, value: string) => {
    setEditForm((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [key]: value,
      },
    }))
    setEditMessage('')
  }

  const verifyDni = async () => {
    const dni = form.dni.replace(/\D+/g, '')
    if (dni.length < 7) {
      setVerification({ status: 'invalid', message: 'Ingresa un DNI valido antes de verificar.' })
      return
    }

    try {
      setVerification({ status: 'checking', message: 'Verificando si el DNI ya existe...' })
      const data = await apiGet<{ items: Escribano[]; total: number }>(buildEscribanosQuery({ dni }))
      if (data.items.length > 0) {
        const existing = data.items[0]
        setVerification({
          status: 'exists',
          message: `El DNI ya existe para ${existing.apellido}, ${existing.nombre}. No se habilita una nueva carga.`,
        })
        return
      }

      setVerification({ status: 'available', message: 'DNI disponible. Ya puedes completar el alta del escribano.' })
    } catch (e) {
      setVerification({ status: 'invalid', message: e instanceof Error ? e.message : 'No se pudo verificar el DNI.' })
    }
  }

  const create = async () => {
    if (verification.status !== 'available') {
      setPageError('Verifica primero que el DNI no exista antes de crear el escribano.')
      return
    }

    try {
      setPageError('')
      await apiPost('/escribanos', buildCreatePayload(form))
      setForm(emptyCreateForm)
      setVerification({ status: 'idle', message: 'Verifica el DNI antes de cargar el resto de los datos.' })
      setFormMessage('Escribano creado correctamente.')
      await load()
    } catch (e) {
      setPageError(e instanceof Error ? e.message : 'No se pudo crear escribano')
    }
  }

  const beginEdit = (item: Escribano) => {
    setSelected(item)
    setEditForm({
      email_personal: item.email_personal ?? '',
      email_laboral: item.email_laboral ?? '',
      telefono: item.telefono ?? '',
      direccion_domicilio: parseAddress(item.direccion_domicilio, item.direccion_domicilio_calle, item.direccion_domicilio_numeracion, item.direccion_domicilio_barrio),
      direccion_estudio: parseAddress(item.direccion_estudio, item.direccion_estudio_calle, item.direccion_estudio_numeracion, item.direccion_estudio_barrio),
      localidad: item.localidad ?? '',
    })
    setEditMessage('')
    setEditError('')
  }

  const saveEdit = async () => {
    if (!selected) return

    try {
      const response = await apiPatch<{ item: Escribano }>('/escribanos', {
        escribano_id: selected.id,
        ...buildEditPayload(editForm),
      })
      setSelected(response.item)
      setEditForm({
        email_personal: response.item.email_personal ?? '',
        email_laboral: response.item.email_laboral ?? '',
        telefono: response.item.telefono ?? '',
        direccion_domicilio: parseAddress(response.item.direccion_domicilio, response.item.direccion_domicilio_calle, response.item.direccion_domicilio_numeracion, response.item.direccion_domicilio_barrio),
        direccion_estudio: parseAddress(response.item.direccion_estudio, response.item.direccion_estudio_calle, response.item.direccion_estudio_numeracion, response.item.direccion_estudio_barrio),
        localidad: response.item.localidad ?? '',
      })
      setEditMessage('Datos actualizados.')
      setEditError('')
      await load()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'No se pudo editar el escribano')
    }
  }

  const verificationColor = verification.status === 'exists' || verification.status === 'invalid'
    ? '#b42318'
    : verification.status === 'available'
      ? '#166534'
      : '#5f6f3f'

  const formLocked = verification.status !== 'available'

  return (
    <div>
      <PageHeader title='Escribanos' subtitle='Alta con verificacion previa por DNI y edicion limitada para administradores' />

      <div style={pageStackStyle}>
        <section style={compactFormCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, color: '#506223' }}>Nuevo escribano</h3>
              <p style={{ margin: '6px 0 0', color: '#6f8050' }}>Primero valida el DNI. El resto del formulario se habilita solo si no existe.</p>
            </div>
          </div>

          <Field label='DNI'>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'nowrap' }}>
              <input value={form.dni} onChange={(e) => setCreateField('dni', e.target.value)} placeholder='Solo numeros' style={dniInputStyle(false)} />
              <button type='button' onClick={verifyDni} style={actionButtonStyle('#dce6b1')}>
                Verificar DNI
              </button>
            </div>
          </Field>

          <div style={{ marginBottom: 14, color: verificationColor, fontWeight: 600 }}>{verification.message}</div>

          <div style={parallelFieldsStyle}>
            <TextField label='Apellido' value={form.apellido} onChange={(value) => setCreateField('apellido', value)} disabled={formLocked} />
            <TextField label='Nombre' value={form.nombre} onChange={(value) => setCreateField('nombre', value)} disabled={formLocked} />
            <TextField label='Matricula' value={form.matricula} onChange={(value) => setCreateField('matricula', value)} disabled={formLocked} />
            <TextField label='Localidad' value={form.localidad} onChange={(value) => setCreateField('localidad', value)} disabled={formLocked} />
            <TextField label='Fecha nacimiento' value={form.fecha_nacimiento} onChange={(value) => setCreateField('fecha_nacimiento', value)} disabled={formLocked} type='date' />
            <TextField label='Fecha egresado' value={form.fecha_egresado} onChange={(value) => setCreateField('fecha_egresado', value)} disabled={formLocked} type='date' />
            <TextField label='Fecha matriculado' value={form.fecha_matriculado} onChange={(value) => setCreateField('fecha_matriculado', value)} disabled={formLocked} type='date' />
            <TextField label='Mail personal' value={form.email_personal} onChange={(value) => setCreateField('email_personal', value)} disabled={formLocked} type='email' />
            <TextField label='Mail laboral' value={form.email_laboral} onChange={(value) => setCreateField('email_laboral', value)} disabled={formLocked} type='email' />
            <TextField label='Celular' value={form.telefono} onChange={(value) => setCreateField('telefono', value)} disabled={formLocked} />
            <WideField>
              <AddressFields
                label='Direccion domicilio'
                value={form.direccion_domicilio}
                onChange={(key, value) => setCreateAddressField('direccion_domicilio', key, value)}
                disabled={formLocked}
              />
            </WideField>
            <WideField>
              <AddressFields
                label='Direccion estudio'
                value={form.direccion_estudio}
                onChange={(key, value) => setCreateAddressField('direccion_estudio', key, value)}
                disabled={formLocked}
              />
            </WideField>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type='button' onClick={create} style={actionButtonStyle('#c7d48b')}>
              Crear escribano
            </button>
            {formMessage ? <span style={{ color: '#166534', fontWeight: 600 }}>{formMessage}</span> : null}
          </div>
          {pageError ? <div style={{ color: '#b42318', marginTop: 10 }}>{pageError}</div> : null}
        </section>

        <section style={recordsCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, color: '#506223' }}>Buscar escribano</h3>
              <p style={{ margin: '6px 0 0', color: '#6f8050' }}>Filtra por apellido, nombre, DNI o matricula y selecciona un registro para editarlo.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar por apellido, nombre, dni o matricula'
              style={{ ...inputStyle(false), maxWidth: 420 }}
            />
            <button type='button' onClick={() => void load(search)} style={actionButtonStyle('#e6ebc4')}>
              Buscar
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <EscribanoTable items={items} canEdit={isAdmin} onEdit={beginEdit} />
          </div>
        </section>

        {isAdmin ? (
          <section style={{ ...compactFormCardStyle, opacity: selected ? 1 : 0.92 }}>
            <h3 style={{ marginTop: 0, marginBottom: 6, color: '#506223' }}>Editar escribano</h3>
            <p style={{ marginTop: 0, color: '#6f8050' }}>
              {selected ? `${selected.apellido}, ${selected.nombre} - DNI ${selected.dni}` : 'Selecciona un escribano de la tabla para editar sus datos permitidos.'}
            </p>

            <div style={parallelFieldsStyle}>
              <TextField label='Mail personal' value={editForm.email_personal} onChange={(value) => setEditForm((current) => ({ ...current, email_personal: value }))} disabled={!selected} type='email' />
              <TextField label='Mail laboral' value={editForm.email_laboral} onChange={(value) => setEditForm((current) => ({ ...current, email_laboral: value }))} disabled={!selected} type='email' />
              <TextField label='Telefono' value={editForm.telefono} onChange={(value) => setEditForm((current) => ({ ...current, telefono: value }))} disabled={!selected} />
              <TextField label='Localidad' value={editForm.localidad} onChange={(value) => setEditForm((current) => ({ ...current, localidad: value }))} disabled={!selected} />
              <WideField>
                <AddressFields
                  label='Direccion domicilio'
                  value={editForm.direccion_domicilio}
                  onChange={(key, value) => setEditAddressField('direccion_domicilio', key, value)}
                  disabled={!selected}
                />
              </WideField>
              <WideField>
                <AddressFields
                  label='Direccion estudio'
                  value={editForm.direccion_estudio}
                  onChange={(key, value) => setEditAddressField('direccion_estudio', key, value)}
                  disabled={!selected}
                />
              </WideField>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type='button' onClick={saveEdit} disabled={!selected} style={actionButtonStyle(selected ? '#c7d48b' : '#e3e7d4', !selected)}>
                Guardar cambios
              </button>
              <button
                type='button'
                onClick={() => {
                  setSelected(null)
                  setEditForm(emptyEditForm)
                  setEditMessage('')
                  setEditError('')
                }}
                style={actionButtonStyle('#f6f7ee')}
              >
                Limpiar seleccion
              </button>
              {editMessage ? <span style={{ color: '#166534', fontWeight: 600 }}>{editMessage}</span> : null}
            </div>
            {editError ? <div style={{ color: '#b42318', marginTop: 10 }}>{editError}</div> : null}
          </section>
        ) : null}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6, marginBottom: 0, width: '100%' }}>
      <span style={{ color: '#506223', fontWeight: 700 }}>{label}</span>
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  type?: string
}) {
  return (
    <Field label={label}>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} disabled={disabled} style={compactInputStyle(disabled)} />
    </Field>
  )
}

function inputStyle(disabled: boolean): CSSProperties {
  return {
    width: '100%',
    padding: '11px 12px',
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

function dniInputStyle(disabled: boolean): CSSProperties {
  return {
    ...inputStyle(disabled),
    width: '25%',
    minWidth: 120,
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

function formatAddress(value: AddressParts): string {
  const parts = [
    `Calle: ${value.calle.trim()}`,
    `Numeracion: ${value.numeracion.trim()}`,
    `Barrio: ${value.barrio.trim()}`,
  ].filter((part) => !part.endsWith(': '))

  return parts.join(' | ')
}

function buildCreatePayload(form: CreateFormState) {
  return {
    ...form,
    direccion_domicilio: formatAddress(form.direccion_domicilio),
    direccion_estudio: formatAddress(form.direccion_estudio),
    direccion_domicilio_calle: form.direccion_domicilio.calle.trim(),
    direccion_domicilio_numeracion: form.direccion_domicilio.numeracion.trim(),
    direccion_domicilio_barrio: form.direccion_domicilio.barrio.trim(),
    direccion_estudio_calle: form.direccion_estudio.calle.trim(),
    direccion_estudio_numeracion: form.direccion_estudio.numeracion.trim(),
    direccion_estudio_barrio: form.direccion_estudio.barrio.trim(),
  }
}

function buildEditPayload(form: EditFormState) {
  return {
    ...form,
    direccion_domicilio: formatAddress(form.direccion_domicilio),
    direccion_estudio: formatAddress(form.direccion_estudio),
    direccion_domicilio_calle: form.direccion_domicilio.calle.trim(),
    direccion_domicilio_numeracion: form.direccion_domicilio.numeracion.trim(),
    direccion_domicilio_barrio: form.direccion_domicilio.barrio.trim(),
    direccion_estudio_calle: form.direccion_estudio.calle.trim(),
    direccion_estudio_numeracion: form.direccion_estudio.numeracion.trim(),
    direccion_estudio_barrio: form.direccion_estudio.barrio.trim(),
  }
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
