import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthUser = { id:number; username:string; email:string; role:string; must_change_password?:boolean } | null

type AuthContextValue = {
  user: AuthUser
  token: string | null
  login: (token:string, user: NonNullable<AuthUser>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'ledi.token'
const USER_KEY = 'ledi.user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedToken) setToken(storedToken)
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)) } catch {}
    }
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    login: (nextToken: string, nextUser: NonNullable<AuthUser>) => {
      localStorage.setItem(TOKEN_KEY, nextToken)
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      setToken(nextToken)
      setUser(nextUser)
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    },
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
