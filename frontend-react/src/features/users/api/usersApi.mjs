export function buildUsersListRequest() { return { method: 'GET', url: '/users' } }
export function buildCreateUserRequest(payload) {
  return {
    method: 'POST',
    url: '/users',
    body: {
      username: String(payload.username ?? '').trim(),
      email: String(payload.email ?? '').trim().toLowerCase(),
      password: String(payload.password ?? ''),
      role: payload.role ?? 'operador',
    },
  }
}
