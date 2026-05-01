import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

function getIniciales(nombre) {
    return (nombre || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function PacientesAdmin() {
    const { usuario } = useAuth();
    const [busqueda, setBusqueda] = useState("");
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!usuario?.id) return;
        setLoading(true);
        setError(null);

        const cargar = async () => {
            try {
                // Obtener todos los pacientes registrados
                const pacientesRes = await axios.get(`http://localhost:8081/usuarios/pacientes`);
                const data = Array.isArray(pacientesRes.data) ? pacientesRes.data : [];
                setPacientes(data);
            } catch {
                setError("No se pudieron cargar los pacientes.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [usuario?.id]);

    const pacientesFiltrados = pacientes.filter((p) => {
        const q = busqueda.toLowerCase();
        return (
            p.nombre?.toLowerCase().includes(q) ||
            p.rut?.includes(busqueda) ||
            p.email?.toLowerCase().includes(q) ||
            p.prevision?.toLowerCase().includes(q) ||
            p.telefono?.includes(busqueda)
        );
    });

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            {/* HERO */}
            <section className="bg-primary px-6 py-10 sm:px-12 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    <span className="badge badge-warning text-info-content font-semibold">
                        Administrador
                    </span>
                    <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
                        Gestión de Pacientes
                    </h1>
                    <p className="text-primary-content/70 text-base sm:text-lg">
                        Pacientes registrados en el sistema.
                    </p>
                </div>
            </section>

            {/* CONTENIDO */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Stat */}
                <div className="stat bg-base-100 rounded-lg shadow-sm mb-8 w-fit">
                    <div className="stat-title">Pacientes registrados</div>
                    <div className="stat-value text-primary text-center">{pacientes.length}</div>
                </div>

                {/* Búsqueda */}
                <div className="card bg-base-100 shadow-sm mb-6">
                    <div className="card-body py-4">
                        <label className="input input-bordered flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
                                <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="text"
                                className="grow"
                                placeholder="Buscar por nombre, RUT o email..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </label>
                    </div>
                </div>

                {/* Estados */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}

                {/* Lista */}
                {!loading && !error && (
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr className="bg-base-200">
                                            <th>Nombre</th>
                                            <th>Rut</th>
                                            <th>Email</th>
                                            <th>Teléfono</th>
                                            <th>Previsión</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pacientesFiltrados.map((paciente) => (
                                            <tr key={paciente.id} className="hover">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar placeholder">
                                                            <div className="bg-primary/10 text-primary rounded-full w-10">
                                                                <span className="text-sm font-bold">{getIniciales(paciente.nombre)}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{paciente.nombre}</div>
                                                            <div className="text-sm opacity-50">{paciente.rut}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-sm">{paciente.rut}</td>
                                                <td className="text-sm">{paciente.email || "—"}</td>
                                                <td className="text-sm">{paciente.telefono || "—"}</td>
                                                <td className="text-sm">{paciente.prevision || "—"}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
                                                        onClick={() => setPacienteSeleccionado(paciente)}
                                                    >
                                                        Ver detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {pacientesFiltrados.length === 0 && (
                                <div className="text-center py-8 text-base-content/50">
                                    {pacientes.length === 0
                                        ? "No hay pacientes registrados."
                                        : "No se encontraron pacientes con esa búsqueda."}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal detalle */}
            {pacienteSeleccionado && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-4">Ficha del Paciente</h3>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="avatar placeholder">
                                <div className="bg-primary/10 text-primary rounded-full w-16">
                                    <span className="text-xl font-bold">{getIniciales(pacienteSeleccionado.nombre)}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{pacienteSeleccionado.nombre}</h4>
                                <p className="text-sm text-base-content/60">{pacienteSeleccionado.rol}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">RUT</span>
                                <span>{pacienteSeleccionado.rut || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Email</span>
                                <span>{pacienteSeleccionado.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Rol</span>
                                <span>{pacienteSeleccionado.rol}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Teléfono</span>
                                <span>{pacienteSeleccionado.telefono || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Previsión</span>
                                <span>{pacienteSeleccionado.prevision || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Fecha de Nacimiento</span>
                                <span>{pacienteSeleccionado.fechaNacimiento || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Género</span>
                                <span>{pacienteSeleccionado.genero || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Tipo de Sangre</span>
                                <span>{pacienteSeleccionado.tipoSangre || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Alergias</span>
                                <span>{pacienteSeleccionado.alergias || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Enfermedades Crónicas</span>
                                <span>{pacienteSeleccionado.enfermedadesCronicas || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Registrado desde</span>
                                <span>
                                    {pacienteSeleccionado.createdAt
                                        ? new Date(pacienteSeleccionado.createdAt).toLocaleDateString()
                                        : "—"}
                                </span>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-sm btn-primary transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => setPacienteSeleccionado(null)}>Cerrar</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setPacienteSeleccionado(null)}></div>
                </div>
            )}

            <Footer />
        </div>
    );
}
