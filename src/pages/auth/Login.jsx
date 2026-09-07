import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMsal } from '@azure/msal-react'
import { useAuth } from '../../context/AuthContext'
import { loginRequest } from '../../auth/loginRequest'

const RUTA_POR_ROL = {
    ADMINISTRADOR: '/admin',
    MEDICO: '/medico',
    PACIENTE: '/paciente',
}

function Login() {
    const { instance } = useMsal()
    const { usuario, cargando } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (cargando) return
        if (!usuario) return

        const destino = RUTA_POR_ROL[usuario.rol]
        if (destino) {
            navigate(destino, { replace: true })
        }
    }, [usuario, cargando, navigate])

    const handleLogin = () => {
        instance.loginRedirect(loginRequest)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h2 className="card-title">MediFlow</h2>
                    <p className="text-sm text-base-content/60">
                        Inicia sesión con tu cuenta institucional
                    </p>
                    <button onClick={handleLogin} className="btn btn-primary mt-4 w-full">
                        Iniciar sesión con Microsoft
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login