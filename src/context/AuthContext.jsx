import { createContext, useContext, useState, useEffect } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { getCurrentUser, fetchAuthSession, signOut as signOutCognito } from 'aws-amplify/auth'
import { api } from '../config/api'

const AuthContext = createContext()

export default function AuthProvider({ children }) {
    const { instance } = useMsal()
    const isAuthenticatedAzure = useIsAuthenticated()
    const [usuario, setUsuario] = useState(null)
    const [medico, setMedico] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [proveedor, setProveedor] = useState(null) // 'azure' | 'cognito' | null

    useEffect(() => {
        async function cargarUsuario() {
            // 1. Primero revisa si hay sesión de Azure (médico/admin)
            if (isAuthenticatedAzure) {
                const cuentas = instance.getAllAccounts()
                const cuenta = instance.getActiveAccount() ?? cuentas[0]

                if (cuenta) {
                    if (!instance.getActiveAccount()) {
                        instance.setActiveAccount(cuenta)
                    }

                    const roles = cuenta.idTokenClaims?.roles ?? []
                    const rol = roles[0] ?? null

                    try {
                        const respuesta = await api.get(`/usuarios/email/${cuenta.username}`)
                        const usuarioReal = { ...respuesta.data, rol }

                        setUsuario(usuarioReal)
                        setProveedor('azure')
                        localStorage.setItem('usuario', JSON.stringify(usuarioReal))
                        localStorage.setItem('proveedor', 'azure')

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
                        setProveedor('azure')
                    }

                    setCargando(false)
                    return
                }
            }

            // 2. Si no hay sesión de Azure, revisa si hay sesión de Cognito (paciente)
            try {
                const cognitoUser = await getCurrentUser()
                const session = await fetchAuthSession()
                const email = cognitoUser.signInDetails?.loginId ?? session.tokens?.idToken?.payload?.email

                if (email) {
                    try {
                        const respuesta = await api.get(`/usuarios/email/${email}`)
                        const usuarioReal = { ...respuesta.data, rol: 'PACIENTE' }

                        setUsuario(usuarioReal)
                        setProveedor('cognito')
                        localStorage.setItem('usuario', JSON.stringify(usuarioReal))
                        localStorage.setItem('proveedor', 'cognito')
                    } catch (error) {
                        console.error('No se encontró el paciente en MS-Usuarios:', error)
                        setUsuario({ email, rol: 'PACIENTE' })
                        setProveedor('cognito')
                    }

                    setCargando(false)
                    return
                }
            } catch {
                // No hay sesión de Cognito tampoco, sigue como no autenticado.
            }

            // 3. No hay sesión de ningún tipo
            setUsuario(null)
            setMedico(null)
            setProveedor(null)
            localStorage.removeItem('usuario')
            localStorage.removeItem('medico')
            localStorage.removeItem('proveedor')
            setCargando(false)
        }

        cargarUsuario()
    }, [isAuthenticatedAzure, instance])

    const login = () => {
        instance.loginRedirect()
    }

    const logout = () => {
        if (proveedor === 'cognito') {
            signOutCognito().then(() => {
                window.location.href = '/login'
            })
        } else {
            instance.logoutRedirect({ postLogoutRedirectUri: '/login' })
        }
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
        <AuthContext.Provider value={{ usuario, medico, cargando, proveedor, login, logout, updateMedico, updateUsuario }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}