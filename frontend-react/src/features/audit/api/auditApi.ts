export function buildAuditListRequest(filters?: { action?: string; target_type?: string }) {
  const params = new URLSearchParams()
  if (filters?.action?.trim()) params.set('action', filters.action.trim())
  if (filters?.target_type?.trim()) params.set('target_type', filters.target_type.trim())
  const q = params.toString()
  return { method: 'GET' as const, url: q ? `/audit?${q}` : '/audit' }
}
