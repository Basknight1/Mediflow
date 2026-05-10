import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [errorLogin, setErrorLogin] = useState("")
    const [cargando, setCargando] = useState(false)

    const navigate = useNavigate()
    const { login } = useAuth()

    const handleLogin = async () => {
        if (!email.trim()) { setErrorLogin("El email es obligatorio"); return }
        if (!password.trim()) { setErrorLogin("La contraseña es obligatoria"); return }

        setErrorLogin("")
        setCargando(true)
        try {
            const response = await axios.post('http://localhost:8081/usuarios/login', { email, password })
            login(response.data)
            const rol = response.data.rol
            if (rol === "ADMINISTRADOR") navigate("/admin")
            else if (rol === "MEDICO") navigate("/medico")
            else if (rol === "PACIENTE") navigate("/paciente")
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 400) {
                setErrorLogin("Credenciales incorrectas. Verifica tu email y contraseña.")
            } else {
                setErrorLogin("No se pudo conectar con el servidor.")
            }
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary to-primary/70 px-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white">
                    Bienvenido a MediFlow
                </h1>
                <p className="text-white/80 mt-2 text-lg font-semibold">
                    Inicia sesión para continuar
                </p>
            </div>

            <fieldset className="fieldset bg-white/95 border-base-300 rounded-box w-xs border p-6 shadow-lg">

                <label className="label">Email</label>
                <label className="input validator">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                            fill="none"
                            stroke="currentColor"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </g>
                    </svg>
                    <input type="email" placeholder="ejemplo@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <div className="validator-hint hidden mt-0">Ingresa un correo válido.</div>

                <label className="label">Contraseña</label>
                <label className="input validator">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path
                                d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                            ></path>
                            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                        </g>
                    </svg>
                    <input
                        type={mostrarPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        minLength="6"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                    >
                        {mostrarPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5 1.467 0 2.87-.292 4.148-.824M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        )}
                    </button>
                </label>
                <div className="validator-hint hidden mt-0">Ingresa una contraseña válida.</div>

                {errorLogin && <p className="text-error text-sm mt-2">{errorLogin}</p>}
                <button
                    className="btn btn-primary mt-4 w-full"
                    onClick={handleLogin}
                    disabled={cargando}
                >
                    {cargando ? <span className="loading loading-spinner loading-sm"></span> : 'Iniciar Sesión'}
                </button>
                <p className="text-center text-sm mt-4 text-base-content/60">
                    ¿No tienes cuenta?{" "}
                    <button onClick={() => navigate("/register")} className="text-primary font-semibold hover:underline">
                        Regístrate aquí
                    </button>
                </p>
            </fieldset>
        </div>
    );
}