import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { EscribanoTable } from '../features/escribanos/components/EscribanoTable'
import type { Escribano } from '../features/escribanos/types'
import { apiGet, apiPost } from '../api/http'
import { buildEscribanosQuery } from '../features/escribanos/api/escribanosApi'

export function EscribanosPage() {
  const [items, setItems] = useState<Escribano[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ apellido: '', nombre: '', dni: '', matricula: '', localidad: '' })
  const [error, setError] = useState('')

  const load = async (nextSearch = search) => {
    try {
      const data = await apiGet<{ items: Escribano[]; total: number }>(buildEscribanosQuery({ search: nextSearch }))
      setItems(data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar escribanos')
    }
  }
  useEffect(() => { load('') }, [])

  const create = async () => {
    try {
      setError('')
      await apiPost('/escribanos', form)
      setForm({ apellido: '', nombre: '', dni: '', matricula: '', localidad: '' })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear escribano')
    }
  }

  return (
    <div>
      <PageHeader title="Escribanos" subtitle="Listado operativo con persistencia real en SQLite" />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
        <section style={{ background: '#fff', border: '1px solid #d8e1eb', borderRadius: 14, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Nuevo escribano</h3>
          <input placeholder='Apellido' value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input placeholder='Nombre' value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input placeholder='DNI' value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input placeholder='Matrícula' value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input placeholder='Localidad' value={form.localidad} onChange={(e) => setForm({ ...form, localidad: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <button onClick={create}>Crear escribano</button>
          {error ? <div style={{ color: '#b42318', marginTop: 10 }}>{error}</div> : null}
        </section>
        <section>
          <div style={{ marginBottom: 12 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Buscar por apellido, nombre, dni o matrícula' style={{ width: '100%', maxWidth: 420, padding: 10 }} />
            <button onClick={() => load(search)} style={{ marginLeft: 8 }}>Buscar</button>
          </div>
          <EscribanoTable items={items} />
        </section>
      </div>
    </div>
  )
}
