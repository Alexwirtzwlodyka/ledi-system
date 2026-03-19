export type UserRole = 'admin' | 'operador' | 'consulta'

export interface UserItem {
  id: number
  username: string
  email: string
  role: UserRole
  is_active: boolean
  must_change_password: boolean
}
