import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'

const RUTA_POR_ROL = {
    ADMINISTRADOR: '/admin',
    MEDICO: '/medico',
    PACIENTE: '/paciente',
}

export default function AuthGate() {
    const { instance, inProgress, accounts } = useMsal()
    const isAuthenticated = useIsAuthenticated()
    const navigate = useNavigate()

    useEffect(() => {

        const cuenta = instance.getActiveAccount() ?? accounts[0]
        const roles = cuenta?.idTokenClaims?.roles ?? []
        const rol = roles[0]

        const destino = RUTA_POR_ROL[rol]
        navigate(destino ?? '/login', { replace: true })
    }, [isAuthenticated, instance, navigate, inProgress, accounts])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg" />
        </div>
    )
}