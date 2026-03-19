import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { apiPost } from '../api/http'
import { lediTheme } from '../theme'

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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: lediTheme.background, padding: 24 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 24,
          background: lediTheme.surface,
          border: `1px solid ${lediTheme.border}`,
          borderRadius: 14,
          boxShadow: '0 18px 40px rgba(91, 111, 46, 0.14)',
        }}
      >
        <PageHeader title='Acceso LeDi' subtitle='Inicio de sesión contra API ejecutable' />
        <label>Usuario</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 14, borderRadius: 10, border: `1px solid ${lediTheme.border}`, background: '#fffef6' }}
        />
        <label>Contraseña</label>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 14, borderRadius: 10, border: `1px solid ${lediTheme.border}`, background: '#fffef6' }}
        />
        {error ? <div style={{ color: '#b42318', marginBottom: 12 }}>{error}</div> : null}
        <button
          disabled={loading}
          onClick={submit}
          style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${lediTheme.border}`, background: '#d7df8d', color: lediTheme.title, fontWeight: 700 }}
        >
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}
