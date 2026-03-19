import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { apiPost } from '../api/http'

type LoginResponse = { token: string; user: { id:number; username:string; email:string; role:string; must_change_password?:boolean } }

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin.1234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to='/' replace />

  const submit = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiPost<LoginResponse>('/auth/login', { username, password })
      login(data.token, data.user)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: '64px auto', padding: 24, background: '#fff', border: '1px solid #d8e1eb', borderRadius: 14 }}>
      <PageHeader title="Acceso LeDi" subtitle="Inicio de sesión contra API ejecutable" />
      <label>Usuario</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 14 }} />
      <label>Contraseña</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 14 }} />
      {error ? <div style={{ color: '#b42318', marginBottom: 12 }}>{error}</div> : null}
      <button disabled={loading} onClick={submit} style={{ padding: '10px 16px' }}>{loading ? 'Ingresando...' : 'Entrar'}</button>
    </div>
  )
}
