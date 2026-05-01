import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const especialidades = [
    { id: 1, nombre: "Medicina General", icono: "💊" },
    { id: 2, nombre: "Cardiología", icono: "❤️" },
    { id: 3, nombre: "Dermatología", icono: "🧴" },
    { id: 4, nombre: "Psicología", icono: "🧑🏻‍⚕️" },
    { id: 5, nombre: "Traumatología", icono: "🦴" },
    { id: 6, nombre: "Neurología", icono: "🧠" },
]


export default function AgendarCita() {

    const { usuario } = useAuth()
    const navigate = useNavigate()

    // Obtenemos el Tipo de Cita que se eligió al agendar y 
    // asignamos para que se guarde el tipo correcto en el backend.
    const obtenerTipoCita = (nombreEspecialidad) => {
        const generales = ["Medicina General"]
        const urgencias = ["Traumatología"]

        if (generales.includes(nombreEspecialidad)) return "GENERAL"
        if (urgencias.includes(nombreEspecialidad)) return "URGENCIA"
        return "ESPECIALIDAD"
    }

    // Hacemos la comunicación con el backend y le insertamos los datos
    // que uno elige en el frontend para ponerlos en el backend Citas.
    const confirmarCita = async () => {
        try {
            await axios.post("http://localhost:8082/citas", {
                pacienteId: usuario.id,
                medicoId: medicoSeleccionado.id,
                fecha: fecha,
                hora: hora,
                tipo: obtenerTipoCita(especialidadSeleccionada?.nombre),
                motivo: motivo
            })
            alert("¡Cita agendada correctamente!")
            navigate("/paciente")

        } catch (error) {
            console.error("Error al agendar la cita:", error)
            alert("Error al agendar la cita")
        }
    }

    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
    const [pasoActual, setPasoActual] = useState(1);
    const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
    const [medicosReales, setMedicosReales] = useState([]);


    // Hacemos la petición de los medicos que hay en el backend
    // Para detectar los médicos existentes y así poderlos mostrar en el frontend.
    useEffect(() => {
        if (especialidadSeleccionada) {
            axios.get(`http://localhost:8081/usuarios/medicos/especialidad/${especialidadSeleccionada.nombre}`)
                .then(res => setMedicosReales(res.data))
                .catch(err => console.error("Error al cargar medicos", err))
        }
    }, [especialidadSeleccionada])

    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");
    const [motivo, setMotivo] = useState("");

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            {/* HERO */}
            <section className="bg-primary px-6 py-10">
                <div className="max-w-3xl mx-auto">
                    <span className="badge badge-success text-success-content font-semibold">
                        Paciente
                    </span>

                    <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
                        Agendar Cita
                    </h1>

                    <p className="text-primary-content/70 text-base sm:text-lg mb-8">
                        Completa los pasos para reservar una cita médica.
                    </p>
                </div>
            </section>
            <main className="max-w-3xl mx-auto px-4 py-8">
                <div>
                    <ul className="steps steps-vertical lg:steps-horizontal">
                        <li className={`step ${pasoActual >= 1 ? "step-primary" : ""}`}>Seleccionar Especialidad</li>
                        <li className={`step ${pasoActual >= 2 ? "step-primary" : ""}`}>Seleccionar Médico</li>
                        <li className={`step ${pasoActual >= 3 ? "step-primary" : ""}`}>Seleccionar Fecha y Hora</li>
                        <li className={`step ${pasoActual >= 4 ? "step-primary" : ""}`}>Confirmar Cita</li>
                    </ul>

                </div>
                <div className="card bg-base-100 shadow-sm p-6 mt-6 border border-primary">
                    {pasoActual === 1 && (
                        <>
                            <h2 className="text-lg font-bold mb-4">¿Qué especialidad necesitas?</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {especialidades.map((esp) => (
                                    <div
                                        key={esp.id}
                                        onClick={() => setEspecialidadSeleccionada(esp)}
                                        className={`card bg-base-100 shadow-sm cursor-pointer border-2 transition-all
              ${especialidadSeleccionada?.id === esp.id
                                                ? "border-primary"
                                                : "border-transparent hover:border-primary/30"}`}
                                    >
                                        <div className="card-body items-center text-center p-4">
                                            <span className="text-3xl">{esp.icono}</span>
                                            <p className="font-semibold text-sm">{esp.nombre}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setPasoActual(2)} disabled={!especialidadSeleccionada} className="btn btn-primary">
                                    Siguiente →
                                </button>
                            </div>
                        </>
                    )}

                    {pasoActual === 2 && (
                        <>
                            <h2 className="text-lg font-bold mb-4">¿Con qué médico quieres atenderte?</h2>
                            <div className="flex flex-col gap-3">
                                {medicosReales
                                    .map((medico) => (
                                        <div
                                            key={medico.id}
                                            onClick={() => setMedicoSeleccionado(medico)}
                                            className={`card bg-base-100 shadow-sm cursor-pointer border-2 transition-all
                ${medicoSeleccionado?.id === medico.id
                                                    ? "border-primary"
                                                    : "border-transparent hover:border-primary/30"}`}
                                        >
                                            <div className="card-body p-4 flex-row items-center gap-4">
                                                <div className="bg-base-200 rounded-full w-12 h-12 flex items-center justify-center text-xl">
                                                    🩺
                                                </div>
                                                <div>
                                                    <p className="font-bold">{medico.nombre}</p>
                                                    <p className="text-sm text-base-content/60">{medico.especialidad}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <div className="flex justify-between mt-4">
                                <button className="btn btn-outline" onClick={() => setPasoActual(1)}>← Atrás</button>
                                <button className="btn btn-primary" onClick={() => setPasoActual(3)} disabled={!medicoSeleccionado}>Siguiente →</button>
                            </div>
                        </>
                    )}
                    {pasoActual === 3 && (
                        <>
                            <h2 className="text-lg font-bold mb-4">Selecciona fecha y hora</h2>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-base-content/70 mb-1 block">Fecha</label>
                                    <input
                                        type="date"
                                        className="input input-bordered w-full"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-base-content/70 mb-1 block">Hora</label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={hora}
                                        onChange={(e) => setHora(e.target.value)}
                                    >
                                        <option value="">Selecciona una hora</option>
                                        <option value="09:00">09:00</option>
                                        <option value="09:30">09:30</option>
                                        <option value="10:00">10:00</option>
                                        <option value="10:30">10:30</option>
                                        <option value="11:00">11:00</option>
                                        <option value="11:30">11:30</option>
                                        <option value="15:00">15:00</option>
                                        <option value="15:30">15:30</option>
                                        <option value="16:00">16:00</option>
                                        <option value="16:30">16:30</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-base-content/70 mb-1 block">Motivo de la consulta</label>
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Describe brevemente el motivo de tu consulta..."
                                        rows={3}
                                        maxLength={100}
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between mt-4">
                                <button className="btn btn-outline" onClick={() => setPasoActual(2)}>← Atrás</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setPasoActual(4)}
                                    disabled={!fecha || !hora}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </>
                    )}
                    {pasoActual === 4 && (
                        <>
                            <h2 className="text-lg font-bold mb-4">Confirma tu cita</h2>

                            <div className="flex flex-col gap-3">
                                <div className="bg-base-200 rounded-xl p-4 flex flex-col gap-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-base-content/60">Especialidad</span>
                                        <span className="font-semibold">{especialidadSeleccionada?.nombre}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-base-content/60">Médico</span>
                                        <span className="font-semibold">{medicoSeleccionado?.nombre}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-base-content/60">Fecha</span>
                                        <span className="font-semibold">
                                            {fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-base-content/60">Hora</span>
                                        <span className="font-semibold">{hora}</span>
                                    </div>
                                    {motivo && (
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="text-sm text-base-content/60">Motivo</span>
                                            <span className="font-semibold text-sm break-all">{motivo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between mt-4">
                                <button className="btn btn-outline" onClick={() => setPasoActual(3)}>← Atrás</button>
                                <button className="btn btn-success text-white" onClick={confirmarCita}>
                                    ✓ Confirmar Cita
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </main>
        </div>

    );
}