import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(() => {
    const savedAuth = localStorage.getItem('authData')

    if (!savedAuth) {
      return null
    }

    return JSON.parse(savedAuth)
  })

  function login(data) {
    localStorage.setItem('authData', JSON.stringify(data))
    setAuthData(data)
  }

  function logout() {
    localStorage.removeItem('authData')
    setAuthData(null)
  }

  const value = useMemo(
    () => ({
      authData,
      token: authData?.token,
      teacher: authData?.teacher,
      isAuthenticated: Boolean(authData?.token),
      login,
      logout,
    }),
    [authData]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}