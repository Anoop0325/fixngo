
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)


const parseUser = (token) => {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id:        payload.user_id,
      email:     payload.email,
      fullName:  payload.full_name,
      role:      payload.role,
      exp:       payload.exp,
    }
  } catch { return null }
}

const isTokenExpired = (token) => {
  const user = parseUser(token)
  if (!user) return true
  return Date.now() >= user.exp * 1000
}


const initialState = {
  user:         null,
  accessToken:  null,
  isLoading:    true,
  isAuthenticated: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, ...action.payload, isLoading: false, isAuthenticated: true }
    case 'CLEAR_AUTH':
      return { ...initialState, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}


export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  
  useEffect(() => {
    const access  = localStorage.getItem('access_token')
    const refresh = localStorage.getItem('refresh_token')

    if (access && !isTokenExpired(access)) {
      const user = parseUser(access)
      dispatch({ type: 'SET_AUTH', payload: { user, accessToken: access } })
    } else if (refresh) {
      
      authService.refreshToken(refresh)
        .then(({ data }) => {
          const { access: newAccess } = data
          localStorage.setItem('access_token', newAccess)
          dispatch({ type: 'SET_AUTH', payload: { user: parseUser(newAccess), accessToken: newAccess } })
        })
        .catch(() => {
          localStorage.clear()
          dispatch({ type: 'CLEAR_AUTH' })
        })
    } else {
      dispatch({ type: 'CLEAR_AUTH' })
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials)
    const { access, refresh, user } = data.data
    localStorage.setItem('access_token',  access)
    localStorage.setItem('refresh_token', refresh)
    dispatch({ type: 'SET_AUTH', payload: { user, accessToken: access } })
    return user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload)
    const { tokens, user } = data.data
    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    dispatch({ type: 'SET_AUTH', payload: { user, accessToken: tokens.access } })
    return user
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    try { await authService.logout(refresh) } catch {  }
    localStorage.clear()
    dispatch({ type: 'CLEAR_AUTH' })
    toast.success('Signed out successfully.')
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
