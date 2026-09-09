import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMsal } from '@azure/msal-react'
import { useAuth } from '../../context/AuthContext'
import { loginRequest } from '../../auth/loginRequest'
import { iniciarSesionCognito } from '../../auth/cognitoAuth'

const RUTA_POR_ROL = {
    ADMINISTRADOR: '/admin',
    MEDICO: '/medico',
    PACIENTE: '/paciente',
}

function Login() {
    const { instance } = useMsal()
    const { usuario, cargando } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verPasswordLogin, setVerPasswordLogin] = useState(false)
    const [errorPaciente, setErrorPaciente] = useState('')
    const [cargandoPaciente, setCargandoPaciente] = useState(false)

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

    const handleLoginPaciente = async (e) => {
        e.preventDefault()
        setErrorPaciente('')
        setCargandoPaciente(true)
        try {
            try {
                await iniciarSesionCognito(email, password)
            } catch (error) {
                // Si ya había una sesión activa, no es un error real: seguimos igual.
                if (!error?.message?.includes('already a signed in user')) {
                    throw error
                }
            }
            localStorage.setItem('proveedor', 'cognito')
            window.location.href = '/paciente'
        } catch (error) {
            setErrorPaciente(error?.message || 'Email o contraseña incorrectos')
        } finally {
            setCargandoPaciente(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-sky-300">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h2 className="card-title">MediFlow</h2>
                    <p className="text-sm text-base-content/60">
                        Inicia sesión con tu cuenta de Microsoft
                    </p>
                    <button onClick={handleLogin} className="btn btn-primary mt-4 w-full">
                        Iniciar sesión con Microsoft
                    </button>

                    <div className="divider">Si eres paciente</div>

                    <form onSubmit={handleLoginPaciente} className="w-full flex flex-col gap-2">
                        {errorPaciente && (
                            <div className="alert alert-error text-sm py-2">
                                <span>{errorPaciente}</span>
                            </div>
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            className="input input-bordered w-full"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <div className="relative">
                            <input
                                type={verPasswordLogin ? "text" : "password"}
                                placeholder="Contraseña"
                                className="input input-bordered w-full pr-10"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50"
                                onClick={() => setVerPasswordLogin(v => !v)}
                            >
                                {verPasswordLogin ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                }
                            </button>
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={cargandoPaciente}>
                            {cargandoPaciente ? <span className="loading loading-spinner loading-sm"></span> : 'Iniciar sesión como paciente'}
                        </button>
                    </form>

                    <p className="text-sm text-base-content/60 mt-2">
                        ¿Eres paciente y no tienes cuenta?{" "}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login