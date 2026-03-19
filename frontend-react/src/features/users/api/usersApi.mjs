function buildQuery(search) {
  const normalized = String(search ?? '').trim()
  return normalized ? `?search=${encodeURIComponent(normalized)}` : ''
}

export function buildUsersListRequest(filters = {}) {
  return { method: 'GET', url: `/users${buildQuery(filters.search)}` }
}
export function buildCreateUserRequest(payload) {
  return {
    method: 'POST',
    url: '/users',
    body: {
      username: String(payload.username ?? '').trim(),
      email: String(payload.email ?? '').trim().toLowerCase(),
      celular: String(payload.celular ?? '').trim(),
      password: String(payload.password ?? ''),
      role: payload.role ?? 'operador',
    },
  }
}

export function buildUpdateUserRequest(payload) {
  const body = {
    user_id: Number(payload.user_id ?? 0),
    email: String(payload.email ?? '').trim().toLowerCase(),
    celular: String(payload.celular ?? '').trim(),
    role: payload.role ?? 'operador',
    is_active: Boolean(payload.is_active),
  }
  if (String(payload.password ?? '').trim()) {
    body.password = String(payload.password)
  }
  return {
    method: 'PATCH',
    url: '/users',
    body,
  }
}

export function buildDeleteUserRequest(userId) {
  return {
    method: 'POST',
    url: '/users/delete',
    body: { user_id: Number(userId ?? 0) },
  }
}
