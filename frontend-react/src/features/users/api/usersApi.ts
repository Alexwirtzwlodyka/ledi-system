import type { UserItem, UserRole } from '../types'

export interface CreateUserPayload {
  username: string
  email: string
  dni: string
  celular: string
  password: string
  role: UserRole
  email_personal: string
  email_laboral: string
  direccion_personal: string
  direccion_laboral: string
  direccion_personal_calle: string
  direccion_personal_numeracion: string
  direccion_personal_barrio: string
  direccion_laboral_calle: string
  direccion_laboral_numeracion: string
  direccion_laboral_barrio: string
  escribano_id_vinculado: number | null
}

export interface UsersListFilters {
  search?: string
}

export interface UpdateUserPayload {
  user_id: number
  email_personal: string
  email_laboral: string
  celular: string
  password?: string
  direccion_personal: string
  direccion_laboral: string
  direccion_personal_calle: string
  direccion_personal_numeracion: string
  direccion_personal_barrio: string
  direccion_laboral_calle: string
  direccion_laboral_numeracion: string
  direccion_laboral_barrio: string
  escribano_id_vinculado: number | null
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
      dni: payload.dni.replace(/\D+/g, ''),
      celular: payload.celular.trim(),
      password: payload.password,
      role: payload.role,
      email_personal: payload.email_personal.trim().toLowerCase(),
      email_laboral: payload.email_laboral.trim().toLowerCase(),
      direccion_personal: payload.direccion_personal.trim(),
      direccion_laboral: payload.direccion_laboral.trim(),
      direccion_personal_calle: payload.direccion_personal_calle.trim(),
      direccion_personal_numeracion: payload.direccion_personal_numeracion.trim(),
      direccion_personal_barrio: payload.direccion_personal_barrio.trim(),
      direccion_laboral_calle: payload.direccion_laboral_calle.trim(),
      direccion_laboral_numeracion: payload.direccion_laboral_numeracion.trim(),
      direccion_laboral_barrio: payload.direccion_laboral_barrio.trim(),
      escribano_id_vinculado: payload.escribano_id_vinculado,
    },
  }
}

export function buildUpdateUserRequest(payload: UpdateUserPayload) {
  return {
    method: 'PATCH' as const,
    url: '/users',
    body: {
      user_id: payload.user_id,
      email_personal: payload.email_personal.trim().toLowerCase(),
      email_laboral: payload.email_laboral.trim().toLowerCase(),
      celular: payload.celular.trim(),
      ...(payload.password ? { password: payload.password } : {}),
      direccion_personal: payload.direccion_personal.trim(),
      direccion_laboral: payload.direccion_laboral.trim(),
      direccion_personal_calle: payload.direccion_personal_calle.trim(),
      direccion_personal_numeracion: payload.direccion_personal_numeracion.trim(),
      direccion_personal_barrio: payload.direccion_personal_barrio.trim(),
      direccion_laboral_calle: payload.direccion_laboral_calle.trim(),
      direccion_laboral_numeracion: payload.direccion_laboral_numeracion.trim(),
      direccion_laboral_barrio: payload.direccion_laboral_barrio.trim(),
      escribano_id_vinculado: payload.escribano_id_vinculado,
    },
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
    dni: String(input.dni ?? ''),
    celular: String(input.celular ?? ''),
    email_personal: String(input.email_personal ?? ''),
    email_laboral: String(input.email_laboral ?? ''),
    direccion_personal: String(input.direccion_personal ?? ''),
    direccion_laboral: String(input.direccion_laboral ?? ''),
    direccion_personal_calle: String(input.direccion_personal_calle ?? ''),
    direccion_personal_numeracion: String(input.direccion_personal_numeracion ?? ''),
    direccion_personal_barrio: String(input.direccion_personal_barrio ?? ''),
    direccion_laboral_calle: String(input.direccion_laboral_calle ?? ''),
    direccion_laboral_numeracion: String(input.direccion_laboral_numeracion ?? ''),
    direccion_laboral_barrio: String(input.direccion_laboral_barrio ?? ''),
    escribano_id_vinculado: input.escribano_id_vinculado === null || input.escribano_id_vinculado === undefined ? null : Number(input.escribano_id_vinculado),
    registro_vinculado: String(input.registro_vinculado ?? ''),
    role: (input.role ?? 'consulta') as UserRole,
    is_active: Boolean(input.is_active),
    must_change_password: Boolean(input.must_change_password),
  }
}
