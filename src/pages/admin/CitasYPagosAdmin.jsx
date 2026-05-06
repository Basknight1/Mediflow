import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AvatarDefault from "../../assets/avatar-default.png";


export default function CitasYPagosAdmin() {
    const { usuario } = useAuth();
    const [busqueda, setBusqueda] = useState("");
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [citas, setCitas] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pacientesMap, setPacientesMap] = useState({});
    const [medicosMap, setMedicosMap] = useState({});
    const [filtroActivo, setFiltroActivo] = useState("Todas");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!usuario?.id) return;
        setLoading(true);
        setError(null);

        const cargar = async () => {
            try {
                const [citasRes, pacientesRes, medicosRes, pagosRes] = await Promise.all([
                    axios.get(`http://localhost:8082/citas`),
                    axios.get(`http://localhost:8081/usuarios/pacientes`),
                    axios.get(`http://localhost:8081/usuarios/medicos`),
                    axios.get(`http://localhost:8083/pagos`)
                ])


                const data = Array.isArray(citasRes.data) ? citasRes.data : []
                setCitas(data)

                // Crear mapas separados para evitar mezclar estructuras
                const mapaPacientes = {};
                (pacientesRes.data || []).forEach((p) => {
                    mapaPacientes[p.id] = p;
                });

                const mapaMedicos = {};
                (medicosRes.data || []).forEach((m) => {
                    mapaMedicos[m.id] = m;
                });

                setPacientesMap(mapaPacientes);
                setMedicosMap(mapaMedicos);
                setCitas(Array.isArray(citasRes.data) ? citasRes.data : [])
                setPagos(Array.isArray(pagosRes.data) ? pagosRes.data : [])

            } catch {
                setError("No se pudieron cargar las citas.")
            } finally {
                setLoading(false)
            }
        }

        cargar()
    }, [usuario?.id])

    // Obtener los pagos de las citas y mostrarlos.
    const obtenerPagoDeCita = (citaId) => {
        return pagos.find(p => p.citaId === citaId) || null
    }

    /* ─── Agrupar citas por fecha ─── */
    function agruparPorFecha(citas) {
        const grupos = {};
        citas.forEach((cita) => {
            if (!grupos[cita.fecha]) grupos[cita.fecha] = [];
            grupos[cita.fecha].push(cita);
        });
        Object.values(grupos).forEach((g) =>
            g.sort((a, b) => a.hora.localeCompare(b.hora))
        );
        return grupos;
    }

    const formatearEstado = (estado) => {
        const estados = {
            CONFIRMADA: "Confirmada",
            PENDIENTE: "Pendiente",
            CANCELADA: "Cancelada",
            FINALIZADA: "Finalizada",
        }
        return estados[estado] || estado
    }

    const formatearTipo = (tipo) => {
        const tipos = {
            GENERAL: "General",
            ESPECIALIDAD: "Especialidad",
            URGENCIA: "Urgencia"
        }
        return tipos[tipo] || tipo
    }

    // PAGOS PENDIENTES Y TOTAL PAGADO EN STATS
    const pagosPendientes = pagos.filter(p => p.estado === "PENDIENTE").length
    const totalPagado = pagos
        .filter(p => p.estado === "PAGADO")
        .reduce((sum, p) => sum + p.monto, 0)

    // Fuera del filter, después del useEffect:
    const hoy = new Date().toISOString().split("T")[0];
    const citasHoy = citas.filter((c) => c.fecha === hoy).length;
    const confirmadas = citas.filter((c) => c.estado === "CONFIRMADA").length;
    const pendientes = citas.filter((c) => c.estado === "PENDIENTE").length;
    const canceladas = citas.filter((c) => c.estado === "CANCELADA").length;

    const citasFiltradas = citas
        .filter((c) => filtroActivo === "Todas" ? true : c.estado === filtroActivo)
        .filter((c) => {
            const q = busqueda.toLowerCase();
            return (
                c.estado?.toLowerCase().includes(q) ||
                c.tipo?.toLowerCase().includes(q) ||
                c.fecha?.toLowerCase().includes(q) ||
                c.hora?.toLowerCase().includes(q) ||
                c.motivo?.toLowerCase().includes(q)
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
                        Gestión de Citas y Pagos
                    </h1>
                    <p className="text-primary-content/70 text-base sm:text-lg">
                        Citas y pagos registrados en el sistema.
                    </p>
                </div>
            </section>

            {/* CONTENIDO */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Fila 1 - métricas principales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="stat bg-base-100 rounded-lg shadow-sm">
                        <div className="stat-title">Total de Citas</div>
                        <div className="stat-value text-primary">{citas.length}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow-sm">
                        <div className="stat-title">Citas hoy</div>
                        <div className="stat-value text-primary">{citasHoy}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow-sm">
                        <div className="stat-title">Pagos pendientes</div>
                        <div className="stat-value text-warning">{pagosPendientes}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow-sm">
                        <div className="stat-title">Total pagado</div>
                        <div className="stat-value text-success">${totalPagado.toLocaleString('es-CL')}</div>
                    </div>
                </div>

                {/* Fila 2 - citas por estado */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="stat bg-base-100 rounded-lg shadow-sm">
                        <div className="stat-title">Confirmadas</div>
                        <div className="stat-value text-success">{confirmadas}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow-sm">
                        <div className="stat-title">Pendientes</div>
                        <div className="stat-value text-warning">{pendientes}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-lg shadow-sm">
                        <div className="stat-title">Canceladas</div>
                        <div className="stat-value text-error">{canceladas}</div>
                    </div>
                </div>

                {/* Búsqueda */}
                <div className="card bg-base-100 shadow-sm mb-6">
                    <div className="card-body py-4">
                        <div className="flex items-center justify-between gap-4">
                            <label className="input input-bordered flex items-center gap-2 w-80">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
                                    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
                                </svg>
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Buscar por Fecha, Hora, Tipo o Estado..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </label>

                            <div className="flex flex-col gap-1 items-end">
                                <p className="text-xs text-gray-500 font-semibold">Filtrar por estado</p>
                                <div className="filter">
                                    {filtroActivo !== "Todas" && (
                                        <input className="btn btn-square btn-sm" type="reset" value="×"
                                            onClick={() => setFiltroActivo("Todas")} />
                                    )}
                                    <input className="btn btn-primary btn-sm" type="radio" name="filtro" aria-label="Confirmada"
                                        checked={filtroActivo === "CONFIRMADA"} onChange={() => setFiltroActivo("CONFIRMADA")} />
                                    <input className="btn btn-primary btn-sm" type="radio" name="filtro" aria-label="Pendiente"
                                        checked={filtroActivo === "PENDIENTE"} onChange={() => setFiltroActivo("PENDIENTE")} />
                                    <input className="btn btn-primary btn-sm" type="radio" name="filtro" aria-label="Cancelada"
                                        checked={filtroActivo === "CANCELADA"} onChange={() => setFiltroActivo("CANCELADA")} />
                                </div>
                            </div>
                        </div>
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
                                            <th>ID</th>
                                            <th>Paciente</th>
                                            <th>Médico</th>
                                            <th>Fecha</th>
                                            <th>Hora</th>
                                            <th>Tipo</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {citasFiltradas.map((cita) => (
                                            <tr key={cita.id} className="hover">
                                                <td>{cita.id}</td>
                                                <td>{pacientesMap[cita.pacienteId]?.nombre || `ID ${cita.pacienteId}`}</td>
                                                <td>{medicosMap[cita.medicoId]?.nombre || `ID ${cita.medicoId}`}</td>
                                                <td>{new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}</td>
                                                <td>{cita.hora?.substring(0, 5)}</td>
                                                <td>{formatearTipo(cita.tipo)}</td>
                                                <td>
                                                    <span className={`badge badge-sm ${cita.estado === 'CONFIRMADA' ? 'badge-success' :
                                                        cita.estado === 'PENDIENTE' ? 'badge-warning' : cita.estado === 'FINALIZADA' ? "badge-primary" : 'badge-error'
                                                        }`}>
                                                        {formatearEstado(cita.estado)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => setCitaSeleccionada(cita)}
                                                    >
                                                        Ver detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {citasFiltradas.length === 0 && (
                                <div className="text-center py-8 text-base-content/50">
                                    {citas.length === 0
                                        ? "No hay citas registradas."
                                        : "No se encontraron citas con esa búsqueda."}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal detalle */}
            {citaSeleccionada && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-4">Detalle de Cita</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">ID Cita</span>
                                <span>{citaSeleccionada.id}</span>
                            </div>

                            <div className="divider my-1"></div>
                            <p className="font-bold text-sm">Paciente</p>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Nombre</span>
                                <span>{pacientesMap[citaSeleccionada.pacienteId]?.nombre || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">RUT</span>
                                <span>{pacientesMap[citaSeleccionada.pacienteId]?.rut || "—"}</span>
                            </div>

                            <div className="divider my-1"></div>
                            <p className="font-bold text-sm">Médico</p>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Nombre</span>
                                <span>{medicosMap[citaSeleccionada.medicoId]?.nombre || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Especialidad</span>
                                <span>{medicosMap[citaSeleccionada.medicoId]?.especialidad || "—"}</span>
                            </div>

                            <div className="divider my-1"></div>
                            <p className="font-bold text-sm">Datos de la Cita</p>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Fecha</span>
                                <span>{citaSeleccionada.fecha?.split('-').reverse().join('/')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Hora</span>
                                <span>{citaSeleccionada.hora?.substring(0, 5)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Tipo</span>
                                <span>{citaSeleccionada.tipo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Estado</span>
                                <span className={`badge badge-sm ${citaSeleccionada.estado === 'CONFIRMADA' ? 'badge-success' :
                                    citaSeleccionada.estado === 'PENDIENTE' ? 'badge-warning' : citaSeleccionada.estado === 'FINALIZADA' ? "badge-primary" : 'badge-error'}`}>
                                    {formatearEstado(citaSeleccionada.estado)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Motivo</span>
                                <span>{citaSeleccionada.motivo || "Sin motivo"}</span>
                            </div>
                            {citaSeleccionada.estado === 'CONFIRMADA' && (
                                <>
                                    <div className="divider my-2"></div>
                                    <p className="font-bold text-sm mb-2">Información de Pago</p>
                                    {obtenerPagoDeCita(citaSeleccionada.id) ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-base-content/60">N° Boleta</span>
                                                <span>{obtenerPagoDeCita(citaSeleccionada.id).numeroBoleta}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-base-content/60">Monto</span>
                                                <span>${obtenerPagoDeCita(citaSeleccionada.id).monto.toLocaleString('es-CL')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-base-content/60">Estado pago</span>
                                                <span className={`badge badge-sm ${obtenerPagoDeCita(citaSeleccionada.id).estado === 'PAGADO'
                                                    ? 'badge-success' : 'badge-warning'
                                                    }`}>
                                                    {obtenerPagoDeCita(citaSeleccionada.id).estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-base-content/50">Sin boleta generada</p>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-sm btn-primary" onClick={() => setCitaSeleccionada(null)}>Cerrar</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setCitaSeleccionada(null)}></div>
                </div>
            )}
            <Footer />
        </div>
    );
}
