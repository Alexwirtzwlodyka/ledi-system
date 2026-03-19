import type { UserItem, UserRole } from '../types'

export interface CreateUserPayload {
  username: string
  email: string
  password: string
  role: UserRole
}

export function buildUsersListRequest() {
  return { method: 'GET' as const, url: '/users' }
}

export function buildCreateUserRequest(payload: CreateUserPayload) {
  return {
    method: 'POST' as const,
    url: '/users',
    body: {
      username: payload.username.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
    },
  }
}

export function mapUserResponse(input: any): UserItem {
  return {
    id: Number(input.id),
    username: String(input.username),
    email: String(input.email),
    role: (input.role ?? 'consulta') as UserRole,
    is_active: Boolean(input.is_active),
    must_change_password: Boolean(input.must_change_password),
  }
}
