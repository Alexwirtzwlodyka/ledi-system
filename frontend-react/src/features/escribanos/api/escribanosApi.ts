export interface EscribanoFilters {
  search?: string
  dni?: string
  matricula?: string
  estado?: string
}

export function buildEscribanosQuery(filters: EscribanoFilters): string {
  const params = new URLSearchParams()

  if (filters.search?.trim()) params.set('search', filters.search.trim())
  if (filters.dni?.trim()) params.set('dni', filters.dni.replace(/\D+/g, ''))
  if (filters.matricula?.trim()) params.set('matricula', filters.matricula.trim())
  if (filters.estado?.trim()) params.set('estado', filters.estado.trim())

  const q = params.toString()
  return q ? `/escribanos?${q}` : '/escribanos'
}
