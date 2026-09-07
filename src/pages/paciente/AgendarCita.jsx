import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { api } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

function esperarAnim() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
}

function IconoCarga({ className }) {
    return (
        <svg className={`animate-spin ${className ?? ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    )
}

const especialidades = [
    { id: 1, nombre: "Medicina General", descripcion: "Atención primaria y preventiva.", icono: "💊" },
    { id: 2, nombre: "Cardiología", descripcion: "Salud cardiovascular y chequeos.", icono: "❤️" },
    { id: 3, nombre: "Dermatología", descripcion: "Cuidado y salud de la piel.", icono: "🧴" },
    { id: 4, nombre: "Psicología", descripcion: "Salud mental y bienestar.", icono: "🧑🏻‍⚕️" },
    { id: 5, nombre: "Traumatología", descripcion: "Huesos, músculos y articulaciones.", icono: "🦴" },
    { id: 6, nombre: "Neurología", descripcion: "Sistema nervioso y cerebro.", icono: "🧠" },
]

const pasos = [
    { num: 1, label: "ESPECIALIDAD" },
    { num: 2, label: "DOCTOR" },
    { num: 3, label: "FECHA Y HORA" },
    { num: 4, label: "CONFIRMAR" },
]

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function MiniCalendario({ fecha, onChange }) {
    const hoy = new Date()
    const hoyStr = hoy.toISOString().split('T')[0]
    const [vista, setVista] = useState({ mes: hoy.getMonth(), año: hoy.getFullYear() })

    useEffect(() => {
        if (!fecha) {
            const h = new Date()
            setVista({ mes: h.getMonth(), año: h.getFullYear() })
        }
    }, [fecha])

    const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
    const primerDia = new Date(vista.año, vista.mes, 1)
    const ultimoDia = new Date(vista.año, vista.mes + 1, 0)
    let offset = primerDia.getDay() - 1
    if (offset < 0) offset = 6

    const celdas = []
    for (let i = 0; i < offset; i++) celdas.push(null)
    for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(d)

    const toDateStr = (d) =>
        `${vista.año}-${String(vista.mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    const prevMes = () => setVista(v => v.mes === 0 ? { mes: 11, año: v.año - 1 } : { mes: v.mes - 1, año: v.año })
    const nextMes = () => setVista(v => v.mes === 11 ? { mes: 0, año: v.año + 1 } : { mes: v.mes + 1, año: v.año })

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={prevMes} className="btn btn-ghost btn-sm btn-circle text-xl leading-none">‹</button>
                <span className="font-semibold text-gray-700 text-sm">{MESES[vista.mes]} {vista.año}</span>
                <button type="button" onClick={nextMes} className="btn btn-ghost btn-sm btn-circle text-xl leading-none">›</button>
            </div>
            <div className="grid grid-cols-7 mb-1">
                {diasSemana.map((d, i) => (
                    <span key={i} className="text-xs text-center text-gray-400 font-medium py-1">{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {celdas.map((dia, idx) => {
                    if (!dia) return <div key={idx} />
                    const dateStr = toDateStr(dia)
                    const isPast = dateStr < hoyStr
                    const isSelected = dateStr === fecha
                    const isToday = dateStr === hoyStr
                    return (
                        <button
                            key={idx}
                            type="button"
                            disabled={isPast}
                            onClick={() => onChange(dateStr)}
                            className={[
                                'aspect-square w-full rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
                                isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer',
                                isSelected ? 'bg-primary text-primary-content' : '',
                                isToday && !isSelected ? 'text-primary font-bold' : '',
                                !isPast && !isSelected ? 'hover:bg-gray-100 text-gray-700' : '',
                            ].filter(Boolean).join(' ')}
                        >
                            {dia}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default function AgendarCita() {
    const { usuario } = useAuth()
    const navigate = useNavigate()

    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null)
    const [medicoSeleccionado, setMedicoSeleccionado] = useState(null)
    const [medicosReales, setMedicosReales] = useState([])
    const [cargandoMedicos, setCargandoMedicos] = useState(false)
    const [horasOcupadas, setHorasOcupadas] = useState([])
    const [fecha, setFecha] = useState("")
    const [hora, setHora] = useState("")
    const [motivo, setMotivo] = useState("")
    const [agendando, setAgendando] = useState(false)
    const [enConfirmacion, setEnConfirmacion] = useState(false)
    const [busqueda, setBusqueda] = useState("")
    const envioEnCursoRef = useRef(false)

    // Paso activo derivado del estado de selección
    const pasoActivo = enConfirmacion ? 4 : medicoSeleccionado ? 3 : especialidadSeleccionada ? 2 : 1

    const obtenerTipoCita = (nombreEspecialidad) => {
        const generales = ["Medicina General"]
        const urgencias = ["Traumatología"]
        if (generales.includes(nombreEspecialidad)) return "GENERAL"
        if (urgencias.includes(nombreEspecialidad)) return "URGENCIA"
        return "ESPECIALIDAD"
    }

    const confirmarCita = () => {
        if (envioEnCursoRef.current) return
        envioEnCursoRef.current = true
        flushSync(() => { setAgendando(true) })
        void (async () => {
            try {
                await esperarAnim()
                await api.post("/citas", {
                    pacienteId: usuario.id,
                    medicoId: medicoSeleccionado.id,
                    fecha,
                    hora,
                    tipo: obtenerTipoCita(especialidadSeleccionada?.nombre),
                    motivo
                })
                alert("¡Cita agendada correctamente!")
                navigate("/paciente")
            } catch (error) {
                console.error("Error al agendar la cita:", error)
                alert("Error al agendar la cita")
            } finally {
                envioEnCursoRef.current = false
                setAgendando(false)
            }
        })()
    }

    useEffect(() => {
        if (especialidadSeleccionada) {
            setMedicoSeleccionado(null)
            setFecha("")
            setHora("")
            setMedicosReales([])
            setCargandoMedicos(true)
            api.get(`/usuarios/medicos/especialidad/${especialidadSeleccionada.nombre}`)
                .then(res => setMedicosReales(res.data))
                .catch(err => console.error("Error al cargar medicos", err))
                .finally(() => setCargandoMedicos(false))
        }
    }, [especialidadSeleccionada])

    useEffect(() => {
        if (medicoSeleccionado && fecha) {
            api.get(`/citas/medico/${medicoSeleccionado.id}/horas-ocupadas?fecha=${fecha}`)
                .then(res => setHorasOcupadas(res.data))
                .catch(err => console.error(err))
        }
    }, [medicoSeleccionado, fecha])

    const generarHorasDisponibles = () => {
        if (!medicoSeleccionado?.horaInicio || !medicoSeleccionado?.horaFin) return []
        const horas = []
        const [hInicio, mInicio] = medicoSeleccionado.horaInicio.split(':').map(Number)
        const [hFin, mFin] = medicoSeleccionado.horaFin.split(':').map(Number)
        let h = hInicio, m = mInicio
        while (h < hFin || (h === hFin && m < mFin)) {
            horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
            m += 30
            if (m >= 60) { m = 0; h++ }
        }
        return horas
    }

    const especialidadesFiltradas = especialidades.filter(e =>
        e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {agendando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]" role="status" aria-live="polite" aria-busy>
                    <div className="flex items-center gap-4 rounded-2xl bg-white px-8 py-5 shadow-2xl border border-gray-100">
                        <IconoCarga className="h-10 w-10 text-primary" />
                        <span className="text-lg font-semibold text-gray-800">Agendando tu cita…</span>
                    </div>
                </div>
            )}

            <Navbar />

            {/* Título */}
            <div className="bg-white border-b border-gray-100 py-7 text-center shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Agendar Nueva Cita</h1>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-gray-100 py-6 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-start relative">
                        <div className="absolute top-[18px] left-[calc(12.5%)] right-[calc(12.5%)] h-0.5 bg-gray-200 z-0" />
                        {pasos.map((paso) => (
                            <div key={paso.num} className="flex flex-col items-center z-10 flex-1">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                                    ${pasoActivo >= paso.num
                                        ? 'bg-primary border-primary text-primary-content'
                                        : 'bg-white border-gray-300 text-gray-400'}`}>
                                    {paso.num}
                                </div>
                                <span className={`text-xs font-semibold mt-2 uppercase tracking-wider text-center transition-colors duration-300
                                    ${pasoActivo >= paso.num ? 'text-primary' : 'text-gray-400'}`}>
                                    {paso.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-8 pb-28">

                {!enConfirmacion ? (
                    <div className="flex flex-col gap-10">

                        {/* SECCIÓN 1: Especialidad */}
                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Seleccione una Especialidad</h2>
                                    <p className="text-gray-500 text-sm mt-1">¿En qué área necesita atención hoy?</p>
                                </div>
                                <div className="relative w-full sm:w-56">
                                    <input
                                        type="text"
                                        placeholder="Buscar especialidad..."
                                        value={busqueda}
                                        onChange={e => setBusqueda(e.target.value)}
                                        className="input input-bordered input-sm w-full pr-8"
                                    />
                                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {especialidadesFiltradas.map((esp) => (
                                    <div
                                        key={esp.id}
                                        onClick={() => setEspecialidadSeleccionada(esp)}
                                        className={`bg-white rounded-2xl p-6 cursor-pointer border-2 transition-all hover:shadow-md
                                            ${especialidadSeleccionada?.id === esp.id
                                                ? 'border-primary shadow-md'
                                                : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl">
                                                {esp.icono}
                                            </div>
                                            <p className="font-semibold text-gray-800 text-sm">{esp.nombre}</p>
                                            <p className="text-gray-400 text-xs leading-snug">{esp.descripcion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECCIÓN 2: Médico */}
                        <section className={`transition-opacity duration-300 ${!especialidadSeleccionada ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                            <h2 className="text-xl font-bold text-gray-800 mb-5">Seleccione un Profesional</h2>
                            {!especialidadSeleccionada ? (
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-sm text-gray-400 text-center">
                                    Selecciona una especialidad primero
                                </div>
                            ) : cargandoMedicos ? (
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 flex justify-center">
                                    <IconoCarga className="h-6 w-6 text-primary" />
                                </div>
                            ) : medicosReales.length === 0 ? (
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-sm text-gray-400 text-center">
                                    No hay médicos disponibles para esta especialidad
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {medicosReales.map((medico) => (
                                        <div
                                            key={medico.id}
                                            onClick={() => { setMedicoSeleccionado(medico); setFecha(""); setHora("") }}
                                            className={`bg-white rounded-2xl px-5 py-4 cursor-pointer border-2 transition-all hover:shadow-md
                                                ${medicoSeleccionado?.id === medico.id
                                                    ? 'border-primary shadow-md'
                                                    : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl shrink-0">🩺</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800">{medico.nombre}</p>
                                                    <p className="text-sm text-gray-500">{medico.especialidad}</p>
                                                    {medico.horaInicio && (
                                                        <p className="text-sm text-gray-400">{medico.horaInicio} - {medico.horaFin}</p>
                                                    )}
                                                </div>
                                                <span className="badge badge-success text-white badge-sm">DISPONIBLE</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* SECCIÓN 3: Fecha y Hora */}
                        <section className={`transition-opacity duration-300 ${!medicoSeleccionado ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h2 className="text-lg font-bold text-gray-700 mb-4">Seleccione Fecha</h2>
                                    <MiniCalendario
                                        fecha={fecha}
                                        onChange={(d) => { setFecha(d); setHora("") }}
                                    />
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h2 className="text-lg font-bold text-gray-700 mb-4">Horarios Disponibles</h2>
                                    {!fecha ? (
                                        <p className="text-sm text-gray-400">Selecciona una fecha primero</p>
                                    ) : generarHorasDisponibles().length === 0 ? (
                                        <p className="text-sm text-gray-400">Este médico no tiene horario definido</p>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            {generarHorasDisponibles().map((h) => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    disabled={horasOcupadas.includes(h)}
                                                    onClick={() => setHora(h)}
                                                    className={[
                                                        'py-3 rounded-xl text-sm font-medium border transition-all',
                                                        horasOcupadas.includes(h)
                                                            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                                                            : hora === h
                                                                ? 'bg-primary text-primary-content border-primary'
                                                                : 'text-gray-600 border-gray-200 hover:border-primary hover:text-primary cursor-pointer',
                                                    ].join(' ')}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 4: Motivo */}
                        <section className={`transition-opacity duration-300 ${!hora ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-700 mb-4">Motivo de la consulta</h2>
                                <textarea
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Describe brevemente el motivo de tu consulta..."
                                    rows={4}
                                    maxLength={100}
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                />
                            </div>
                        </section>

                    </div>
                ) : (
                    /* PASO 4: Confirmación */
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Confirma tu cita</h2>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex flex-col divide-y divide-gray-100">
                                {[
                                    { label: "Especialidad", valor: especialidadSeleccionada?.nombre },
                                    { label: "Médico", valor: medicoSeleccionado?.nombre },
                                    {
                                        label: "Fecha", valor: fecha
                                            ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
                                            : ''
                                    },
                                    { label: "Hora", valor: hora },
                                ].map(({ label, valor }) => (
                                    <div key={label} className="flex justify-between items-center py-3">
                                        <span className="text-sm text-gray-500">{label}</span>
                                        <span className="font-semibold text-gray-800">{valor}</span>
                                    </div>
                                ))}
                                {motivo && (
                                    <div className="flex flex-col gap-1 py-3">
                                        <span className="text-sm text-gray-500">Motivo</span>
                                        <span className="font-semibold text-gray-800 text-sm">{motivo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setEnConfirmacion(false)}
                                disabled={agendando}
                            >
                                ← Atrás
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary min-w-44 gap-2"
                                onClick={confirmarCita}
                                disabled={agendando}
                                aria-busy={agendando}
                            >
                                {agendando ? (
                                    <><IconoCarga className="h-5 w-5 shrink-0 text-primary-content" />Agendando…</>
                                ) : "Confirmar cita"}
                            </button>
                        </div>
                    </div>
                )}

            </main>

            {/* Barra inferior fija */}
            {!enConfirmacion && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center shadow-lg z-40">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Selección actual</p>
                        <p className="font-bold text-gray-800">{especialidadSeleccionada?.nombre ?? "Ninguna"}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/paciente')} className="btn btn-ghost">Cancelar</button>
                        <button
                            onClick={() => setEnConfirmacion(true)}
                            disabled={!especialidadSeleccionada || !medicoSeleccionado || !fecha || !hora}
                            className="btn btn-primary"
                        >
                            Siguiente Paso →
                        </button>
                    </div>
                </div>
            )}

        </div>
    )
}
