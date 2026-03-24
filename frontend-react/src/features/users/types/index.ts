export type UserRole = 'admin' | 'operador' | 'consulta'

export interface UserItem {
  id: number
  username: string
  email: string
  dni: string
  celular: string
  email_personal: string
  email_laboral: string
  direccion_personal: string
  direccion_laboral: string
  direccion_personal_calle?: string
  direccion_personal_numeracion?: string
  direccion_personal_barrio?: string
  direccion_laboral_calle?: string
  direccion_laboral_numeracion?: string
  direccion_laboral_barrio?: string
  escribano_id_vinculado: number | null
  registro_vinculado: string
  role: UserRole
  is_active: boolean
  must_change_password: boolean
}
