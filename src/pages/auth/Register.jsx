import { useState } from "react";
import { api } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { registrarEnCognito, confirmarCodigoCognito, iniciarSesionCognito, reenviarCodigoCognito } from "../../auth/cognitoAuth";

const PASOS = ["Datos personales", "Seguridad", "Información médica", "Datos opcionales", "Confirmación", "Verificar email"];

export default function Register() {
    const navigate = useNavigate()
    const [paso, setPaso] = useState(1)
    const [reenviarDisponibleEn, setReenviarDisponibleEn] = useState(0)
    const [verPassword, setVerPassword] = useState(false)
    const [verConfirmarPassword, setVerConfirmarPassword] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [errores, setErrores] = useState({})
    const [codigo, setCodigo] = useState("")
    const [datos, setDatos] = useState({
        nombre: "", rut: "", email: "", telefono: "",
        fechaNacimiento: "", genero: "",
        password: "", confirmarPassword: "",
        prevision: "", tipoSangre: "", alergias: "", enfermedadesCronicas: "",
        direccion: "", contactoEmergenciaNombre: "", contactoEmergenciaTelefono: ""
    })

    const actualizar = (campo, valor) => setDatos(prev => ({ ...prev, [campo]: valor }))

    const validarPaso = () => {
        const e = {}
        if (paso === 1) {
            if (!datos.nombre.trim()) e.nombre = "Obligatorio"
            if (!datos.rut.trim()) e.rut = "Obligatorio"
            else if (!/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(datos.rut)) e.rut = "Formato inválido. Ej: 12.345.678-9"
            if (!datos.email.trim()) e.email = "Obligatorio"
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) e.email = "Email inválido"
            if (!datos.telefono.trim()) e.telefono = "Obligatorio"
            else if (datos.telefono.length < 9 || datos.telefono.length > 9) e.telefono = "Mínimo o máximo 9 caracteres"
            if (!datos.fechaNacimiento) {
                e.fechaNacimiento = "Obligatorio"
            } else {
                const hoy = new Date()
                const nacimiento = new Date(datos.fechaNacimiento)
                const edad = hoy.getFullYear() - nacimiento.getFullYear()
                const cumpleEsteAno = hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())
                const edadReal = cumpleEsteAno ? edad - 1 : edad

                if (nacimiento > hoy) e.fechaNacimiento = "La fecha no puede ser futura"
                else if (edadReal < 18) e.fechaNacimiento = "Debes ser mayor de 18 años"
            }
            if (!datos.genero) e.genero = "Selecciona un género"
        }
        if (paso === 2) {
            if (!datos.password.trim()) e.password = "Obligatorio"
            else if (datos.password.length < 8) e.password = "Mínimo 8 caracteres"
            else if (!/[A-Z]/.test(datos.password)) e.password = "Debe incluir al menos una mayúscula"
            else if (!/[a-z]/.test(datos.password)) e.password = "Debe incluir al menos una minúscula"
            else if (!/[0-9]/.test(datos.password)) e.password = "Debe incluir al menos un número"
            else if (!/[^A-Za-z0-9]/.test(datos.password)) e.password = "Debe incluir al menos un carácter especial (!@#$...)"
            if (!datos.confirmarPassword.trim()) e.confirmarPassword = "Obligatorio"
            else if (datos.password !== datos.confirmarPassword) e.confirmarPassword = "Las contraseñas no coinciden"
        }
        if (paso === 3) {
            if (!datos.prevision) e.prevision = "Selecciona una previsión"
            if (!datos.tipoSangre) e.tipoSangre = "Selecciona tu tipo de sangre"
        }
        setErrores(e)
        return Object.keys(e).length === 0
    }

    const siguiente = () => {
        if (validarPaso()) setPaso(p => p + 1)
    }

    // Paso 5 -> crea la cuenta en Cognito y pasa al paso de verificación
    const crearCuentaCognito = async () => {
        setCargando(true)
        setErrores({})
        try {
            await registrarEnCognito(datos.email, datos.password, datos.nombre)
            setPaso(6) // pasa a "Verificar email"
        } catch (error) {
            setErrores({ general: error?.message || "Error al crear la cuenta" })
        } finally {
            setCargando(false)
        }
    }

    // Paso 6 -> confirma el código, guarda el perfil completo en MS-Usuarios, inicia sesión
    const confirmarYRegistrar = async () => {
        setCargando(true)
        setErrores({})
        try {
            try {
                await confirmarCodigoCognito(datos.email, codigo)
            } catch (error) {
                // Si la cuenta ya estaba confirmada de un intento anterior, no es un error real.
                const yaConfirmado = error?.message?.includes('CONFIRMED')
                if (!yaConfirmado) throw error
            }

            await api.post("/auth/register", {
                ...datos,
                rol: "PACIENTE",
                confirmarPassword: undefined
            })

            await iniciarSesionCognito(datos.email, datos.password)
            localStorage.setItem('proveedor', 'cognito')

            window.location.href = "/paciente"
        } catch (error) {
            const data = error?.response?.data
            let mensaje = error?.message || "Error al confirmar la cuenta"
            if (typeof data === 'string') mensaje = data
            else if (typeof data?.message === 'string') mensaje = data.message
            setErrores({ general: mensaje })
        } finally {
            setCargando(false)
        }
    }

    const reenviarCodigo = async () => {
        if (reenviarDisponibleEn > 0) return

        try {
            await reenviarCodigoCognito(datos.email)
            setErrores({ general: "Código reenviado, revisa tu email." })

            setReenviarDisponibleEn(30)
            const intervalo = setInterval(() => {
                setReenviarDisponibleEn(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalo)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (error) {
            setErrores({ general: error?.message || "No se pudo reenviar el código" })
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary to-primary/70 px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white">
                    Crea tu cuenta en{" "}
                    <span className="text-secondary">segundos</span>
                </h1>
                <p className="text-white/80 mt-2 text-lg font-semibold">
                    Completa tus datos para comenzar
                </p>
            </div>

            <div className="bg-white/95 rounded-box border border-base-300 w-full max-w-md p-6 shadow-lg">

                <ul className="steps w-full mb-6">
                    {PASOS.map((_, i) => (
                        <li key={i} className={`step ${paso > i ? 'step-primary' : ''}`}></li>
                    ))}
                </ul>

                <h2 className="font-bold text-lg mb-4">{PASOS[paso - 1]}</h2>

                {errores.general && (
                    <div className="alert alert-error mb-4">
                        <span>{errores.general}</span>
                    </div>
                )}

                {paso === 1 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Nombre completo</label>
                            <input className={`input input-bordered w-full ${errores.nombre ? 'input-error' : ''}`} placeholder="Juan Pérez" value={datos.nombre} onChange={e => actualizar('nombre', e.target.value)} />
                            {errores.nombre && <span className="text-xs text-error">{errores.nombre}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">RUT</label>
                            <input className={`input input-bordered w-full ${errores.rut ? 'input-error' : ''}`} placeholder="12.345.678-9" value={datos.rut} onChange={e => actualizar('rut', e.target.value)} />
                            {errores.rut && <span className="text-xs text-error">{errores.rut}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Email</label>
                            <input className={`input input-bordered w-full ${errores.email ? 'input-error' : ''}`} type="email" placeholder="juan@gmail.com" value={datos.email} onChange={e => actualizar('email', e.target.value)} />
                            {errores.email && <span className="text-xs text-error">{errores.email}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Teléfono</label>
                            <input className={`input input-bordered w-full ${errores.telefono ? 'input-error' : ''}`} placeholder="912345678" value={datos.telefono} onChange={e => actualizar('telefono', e.target.value)} />
                            {errores.telefono && <span className="text-xs text-error">{errores.telefono}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Fecha de nacimiento</label>
                            <input
                                className={`input input-bordered w-full ${errores.fechaNacimiento ? 'input-error' : ''}`}
                                type="date"
                                max={new Date().toISOString().split('T')[0]}
                                value={datos.fechaNacimiento}
                                onChange={e => actualizar('fechaNacimiento', e.target.value)}
                            />
                            {errores.fechaNacimiento && <span className="text-xs text-error">{errores.fechaNacimiento}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Género</label>
                            <select className={`select select-bordered w-full ${errores.genero ? 'select-error' : ''}`} value={datos.genero} onChange={e => actualizar('genero', e.target.value)}>
                                <option value="">Selecciona...</option>
                                <option>Masculino</option>
                                <option>Femenino</option>
                            </select>
                            {errores.genero && <span className="text-xs text-error">{errores.genero}</span>}
                        </div>
                    </div>
                )}

                {paso === 2 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Contraseña</label>
                            <div className="relative">
                                <input
                                    className={`input input-bordered w-full pr-10 ${errores.password ? 'input-error' : ''}`}
                                    type={verPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={datos.password}
                                    onChange={e => actualizar('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50"
                                    onClick={() => setVerPassword(v => !v)}
                                >
                                    {verPassword ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                        : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    }
                                </button>
                            </div>
                            {errores.password && <span className="text-xs text-error">{errores.password}</span>}
                            <span className="text-xs text-base-content/50">Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Confirmar contraseña</label>
                            <div className="relative">
                                <input
                                    className={`input input-bordered w-full pr-10 ${errores.confirmarPassword ? 'input-error' : ''}`}
                                    type={verConfirmarPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={datos.confirmarPassword}
                                    onChange={e => actualizar('confirmarPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50"
                                    onClick={() => setVerConfirmarPassword(v => !v)}
                                >
                                    {verConfirmarPassword ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>}
                                </button>
                            </div>
                            {errores.confirmarPassword && <span className="text-xs text-error">{errores.confirmarPassword}</span>}
                        </div>
                    </div>
                )}

                {paso === 3 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Previsión</label>
                            <select className={`select select-bordered w-full ${errores.prevision ? 'select-error' : ''}`} value={datos.prevision} onChange={e => actualizar('prevision', e.target.value)}>
                                <option value="">Selecciona...</option>
                                <option>Fonasa</option>
                                <option>Isapre</option>
                                <option>Particular</option>
                            </select>
                            {errores.prevision && <span className="text-xs text-error">{errores.prevision}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Tipo de sangre</label>
                            <select className={`select select-bordered w-full ${errores.tipoSangre ? 'select-error' : ''}`} value={datos.tipoSangre} onChange={e => actualizar('tipoSangre', e.target.value)}>
                                <option value="">Selecciona...</option>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>O+</option><option>O-</option>
                                <option>AB+</option><option>AB-</option>
                            </select>
                            {errores.tipoSangre && <span className="text-xs text-error">{errores.tipoSangre}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Alergias <span className="text-base-content/40">(opcional)</span></label>
                            <input className="input input-bordered w-full" placeholder="Penicilina, Látex..." value={datos.alergias} onChange={e => actualizar('alergias', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Enfermedades crónicas <span className="text-base-content/40">(opcional)</span></label>
                            <input className="input input-bordered w-full" placeholder="Diabetes, Hipertensión..." value={datos.enfermedadesCronicas} onChange={e => actualizar('enfermedadesCronicas', e.target.value)} />
                        </div>
                    </div>
                )}

                {paso === 4 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Dirección <span className="text-base-content/40">(opcional)</span></label>
                            <input className="input input-bordered w-full" placeholder="Av. Principal 123" value={datos.direccion} onChange={e => actualizar('direccion', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Nombre contacto de emergencia <span className="text-base-content/40">(opcional)</span></label>
                            <input className="input input-bordered w-full" placeholder="María González" value={datos.contactoEmergenciaNombre} onChange={e => actualizar('contactoEmergenciaNombre', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Teléfono contacto de emergencia <span className="text-base-content/40">(opcional)</span></label>
                            <input className="input input-bordered w-full" placeholder="987654321" value={datos.contactoEmergenciaTelefono} onChange={e => actualizar('contactoEmergenciaTelefono', e.target.value)} />
                        </div>
                    </div>
                )}

                {paso === 5 && (
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between"><span className="text-base-content/60">Nombre</span><span>{datos.nombre}</span></div>
                        <div className="flex justify-between"><span className="text-base-content/60">RUT</span><span>{datos.rut}</span></div>
                        <div className="flex justify-between"><span className="text-base-content/60">Email</span><span>{datos.email}</span></div>
                        <div className="flex justify-between"><span className="text-base-content/60">Teléfono</span><span>{datos.telefono}</span></div>
                        <div className="flex justify-between"><span className="text-base-content/60">Fecha de nacimiento</span><span>{datos.fechaNacimiento?.split('-').reverse().join('/')}</span></div>
                        <div className="flex justify-between"><span className="text-base-content/60">Género</span><span>{datos.genero}</span></div>
                        <div className="divider my-1"></div>
                        <div className="flex justify-between"><span className="text-base-content/60">Previsión</span><span>{datos.prevision}</span></div>
                        <div className="flex justify-between"><span className="text-base-content/60">Tipo de sangre</span><span>{datos.tipoSangre}</span></div>
                        {datos.alergias && <div className="flex justify-between"><span className="text-base-content/60">Alergias</span><span>{datos.alergias}</span></div>}
                        {datos.enfermedadesCronicas && <div className="flex justify-between"><span className="text-base-content/60">Enf. crónicas</span><span>{datos.enfermedadesCronicas}</span></div>}
                    </div>
                )}

                {paso === 6 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-base-content/70">
                            Enviamos un código de verificación a <b>{datos.email}</b>. Ingrésalo abajo para activar tu cuenta.
                        </p>

                        <input
                            className="input input-bordered w-full text-center text-lg tracking-widest"
                            placeholder="123456"
                            maxLength={6}
                            value={codigo}
                            onChange={e => setCodigo(e.target.value)}
                        />
                        <button
                            className="text-xs text-primary hover:underline disabled:text-base-content/40 disabled:no-underline disabled:cursor-not-allowed"
                            onClick={reenviarCodigo}
                            disabled={reenviarDisponibleEn > 0}
                        >
                            {reenviarDisponibleEn > 0 ? `Reenviar código (${reenviarDisponibleEn}s)` : 'Reenviar código'}
                        </button>
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    {paso > 1 && paso < 6 ? (
                        <button className="btn btn-outline" onClick={() => setPaso(p => p - 1)}>← Atrás</button>
                    ) : paso === 1 ? (
                        <button className="btn btn-ghost" onClick={() => navigate("/login")}>← Volver</button>
                    ) : <div />}

                    {paso < 5 && (
                        <button className="btn btn-primary" onClick={siguiente}>Siguiente →</button>
                    )}
                    {paso === 5 && (
                        <button className="btn btn-primary" onClick={crearCuentaCognito} disabled={cargando}>
                            {cargando ? <span className="loading loading-spinner loading-sm"></span> : '✓ Crear cuenta'}
                        </button>
                    )}
                    {paso === 6 && (
                        <button className="btn btn-primary" onClick={confirmarYRegistrar} disabled={cargando || codigo.length < 6}>
                            {cargando ? <span className="loading loading-spinner loading-sm"></span> : 'Verificar y entrar'}
                        </button>
                    )}
                </div>

                {paso < 6 && (
                    <p className="text-center text-sm text-base-content/60 mt-4">
                        ¿Ya tienes cuenta?{" "}
                        <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">
                            Inicia sesión
                        </button>
                    </p>
                )}
            </div>
        </div>
    )
}