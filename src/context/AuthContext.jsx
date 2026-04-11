import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export default function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)

    const login = (datos) => {
        setUsuario(datos) // guarda token, rol, nombre, email
    }

    const logout = () => {
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}