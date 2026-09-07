import { useState } from "react";
import { api } from "../../config/api";
import { useNavigate } from "react-router-dom";

const PASOS = ["Datos personales", "Seguridad", "Información médica", "Datos opcionales", "Confirmación"];

export default function Register() {
    const navigate = useNavigate()
    const [paso, setPaso] = useState(1)
    const [cargando, setCargando] = useState(false)
    const [errores, setErrores] = useState({})
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
            else if (datos.password.length < 6) e.password = "Mínimo 6 caracteres"
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

    const registrar = async () => {
        setCargando(true)
        try {
            await api.post("/auth/register", {
                ...datos,
                rol: "PACIENTE",
                confirmarPassword: undefined
            })
            navigate("/login")
        } catch (error) {
            const data = error?.response?.data
            let mensaje = "Error al registrarse"
            if (typeof data === 'string') mensaje = data
            else if (typeof data?.message === 'string') mensaje = data.message
            setErrores({ general: mensaje })
            setPaso(1)
        } finally {
            setCargando(false)
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

                {/* Indicador de pasos */}
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

                {/* Paso 1 - Datos personales */}
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

                {/* Paso 2 - Seguridad */}
                {paso === 2 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Contraseña</label>
                            <input className={`input input-bordered w-full ${errores.password ? 'input-error' : ''}`} type="password" placeholder="••••••••" value={datos.password} onChange={e => actualizar('password', e.target.value)} />
                            {errores.password && <span className="text-xs text-error">{errores.password}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-base-content/70">Confirmar contraseña</label>
                            <input className={`input input-bordered w-full ${errores.confirmarPassword ? 'input-error' : ''}`} type="password" placeholder="••••••••" value={datos.confirmarPassword} onChange={e => actualizar('confirmarPassword', e.target.value)} />
                            {errores.confirmarPassword && <span className="text-xs text-error">{errores.confirmarPassword}</span>}
                        </div>
                    </div>
                )}

                {/* Paso 3 - Información médica */}
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

                {/* Paso 4 - Datos opcionales */}
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

                {/* Paso 5 - Confirmación */}
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

                {/* Botones */}
                <div className="flex justify-between mt-6">
                    {paso > 1 ? (
                        <button className="btn btn-outline" onClick={() => setPaso(p => p - 1)}>← Atrás</button>
                    ) : (
                        <button className="btn btn-ghost" onClick={() => navigate("/login")}>← Volver</button>
                    )}
                    {paso < 5 ? (
                        <button className="btn btn-primary" onClick={siguiente}>Siguiente →</button>
                    ) : (
                        <button className="btn btn-primary" onClick={registrar} disabled={cargando}>
                            {cargando ? <span className="loading loading-spinner loading-sm"></span> : '✓ Crear cuenta'}
                        </button>
                    )}
                </div>

                <p className="text-center text-sm text-base-content/60 mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">
                        Inicia sesión
                    </button>
                </p>
            </div>
        </div>
    )
}