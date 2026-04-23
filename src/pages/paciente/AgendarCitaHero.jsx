import { useState } from "react";
import Navbar from "../../components/Navbar";

const especialidades = [
    { id: 1, nombre: "Medicina General", icono: "💊" },
    { id: 2, nombre: "Cardiología", icono: "❤️" },
    { id: 3, nombre: "Dermatología", icono: "🧴" },
    { id: 4, nombre: "Psicología", icono: "🧑🏻‍⚕️" },
    { id: 5, nombre: "Traumotología", icono: "🦴" },
    { id: 6, nombre: "Neurología", icono: "🧠" },

]

const medicos = [
    { id: 1, nombre: "Dra. Ana López", especialidad: "Dermatología" },
    { id: 2, nombre: "Dr. Carlos Ruiz", especialidad: "Cardiología" },
    { id: 3, nombre: "Dra. María Paz Soler", especialidad: "Psicología" },
    { id: 4, nombre: "Dr. José Contreras", especialidad: "Traumatología" },
    { id: 5, nombre: "Dra. Valentina Torres", especialidad: "Medicina General" },
    { id: 6, nombre: "Dr. Rodrigo Valdés", especialidad: "Neurología" },
]


export default function AgendarCitaHero() {

    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
    const [pasoActual, setPasoActual] = useState(1);
    const [medicoSeleccionado, setMedicoSeleccionado] = useState(null)

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
                                {medicos
                                    .filter(m => m.especialidad === especialidadSeleccionada?.nombre)
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
                </div>

            </main>
        </div>

    );
}