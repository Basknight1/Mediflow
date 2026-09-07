import { createContext, useContext, useState, useEffect } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { api } from '../config/api'

const AuthContext = createContext()

export default function AuthProvider({ children }) {
    const { instance } = useMsal()
    const isAuthenticated = useIsAuthenticated()
    const [usuario, setUsuario] = useState(null)
    const [medico, setMedico] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        async function cargarUsuario() {
            if (!isAuthenticated) {
                setUsuario(null)
                setMedico(null)
                localStorage.removeItem('usuario')
                localStorage.removeItem('medico')
                setCargando(false)
                return
            }

            const cuentas = instance.getAllAccounts()
            const cuenta = instance.getActiveAccount() ?? cuentas[0]

            if (!cuenta) {
                setCargando(false)
                return
            }

            // Si no había cuenta activa marcada, la marcamos ahora
            if (!instance.getActiveAccount()) {
                instance.setActiveAccount(cuenta)
            }

            const roles = cuenta.idTokenClaims?.roles ?? []
            const rol = roles[0] ?? null

            try {
                const respuesta = await api.get(`/usuarios/email/${cuenta.username}`)
                const usuarioReal = { ...respuesta.data, rol } // rol viene de Azure, sobrescribe lo que diga la BD

                setUsuario(usuarioReal)
                localStorage.setItem('usuario', JSON.stringify(usuarioReal))

                if (usuarioReal.rol === 'MEDICO') {
                    setMedico(usuarioReal)
                    localStorage.setItem('medico', JSON.stringify(usuarioReal))
                }
            } catch (error) {
                console.error('No se encontró el usuario en MS-Usuarios:', error)
                const usuarioBasico = {
                    id: cuenta.localAccountId,
                    nombre: cuenta.name,
                    email: cuenta.username,
                    rol,
                }
                setUsuario(usuarioBasico)
            }

            setCargando(false)
        }

        cargarUsuario()
    }, [isAuthenticated, instance])

    const login = () => {
        instance.loginRedirect()
    }

    const logout = () => {
        instance.logoutRedirect({ postLogoutRedirectUri: '/login' })
    }

    const updateMedico = (datosMedico) => {
        setMedico(datosMedico)
        localStorage.setItem('medico', JSON.stringify(datosMedico))
    }

    const updateUsuario = (datosUsuario) => {
        setUsuario(datosUsuario)
        localStorage.setItem('usuario', JSON.stringify(datosUsuario))
    }

    return (
        <AuthContext.Provider value={{ usuario, medico, cargando, login, logout, updateMedico, updateUsuario }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}