import type { UserItem, UserRole } from '../types'

export interface CreateUserPayload {
  username: string
  email: string
  celular: string
  password: string
  role: UserRole
}

export interface UsersListFilters {
  search?: string
}

export interface UpdateUserPayload {
  user_id: number
  email: string
  celular: string
  password?: string
  role: UserRole
  is_active: boolean
}

function buildQuery(search?: string): string {
  const normalized = search?.trim() ?? ''
  return normalized ? `?search=${encodeURIComponent(normalized)}` : ''
}

export function buildUsersListRequest(filters: UsersListFilters = {}) {
  return { method: 'GET' as const, url: `/users${buildQuery(filters.search)}` }
}

export function buildCreateUserRequest(payload: CreateUserPayload) {
  return {
    method: 'POST' as const,
    url: '/users',
    body: {
      username: payload.username.trim(),
      email: payload.email.trim().toLowerCase(),
      celular: payload.celular.trim(),
      password: payload.password,
      role: payload.role,
    },
  }
}

export function buildUpdateUserRequest(payload: UpdateUserPayload) {
  const body: Record<string, unknown> = {
    user_id: payload.user_id,
    email: payload.email.trim().toLowerCase(),
    celular: payload.celular.trim(),
    role: payload.role,
    is_active: payload.is_active,
  }

  if (payload.password?.trim()) {
    body.password = payload.password
  }

  return {
    method: 'PATCH' as const,
    url: '/users',
    body,
  }
}

export function buildDeleteUserRequest(userId: number) {
  return {
    method: 'POST' as const,
    url: '/users/delete',
    body: { user_id: userId },
  }
}

export function mapUserResponse(input: any): UserItem {
  return {
    id: Number(input.id),
    username: String(input.username),
    email: String(input.email),
    celular: String(input.celular ?? ''),
    role: (input.role ?? 'consulta') as UserRole,
    is_active: Boolean(input.is_active),
    must_change_password: Boolean(input.must_change_password),
  }
}
