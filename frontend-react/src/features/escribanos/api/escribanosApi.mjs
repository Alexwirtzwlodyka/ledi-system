export function buildEscribanosQuery(filters) {
  const params = new URLSearchParams()
  if (String(filters.search ?? '').trim()) params.set('search', String(filters.search).trim())
  if (String(filters.dni ?? '').trim()) params.set('dni', String(filters.dni).replace(/\D+/g, ''))
  if (String(filters.matricula ?? '').trim()) params.set('matricula', String(filters.matricula).trim())
  if (String(filters.estado ?? '').trim()) params.set('estado', String(filters.estado).trim())
  const q = params.toString()
  return q ? `/escribanos?${q}` : '/escribanos'
}
