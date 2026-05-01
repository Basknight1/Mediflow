import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

function getIniciales(nombre) {
    return (nombre || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function MedicosAdmin() {
    const { usuario } = useAuth();
    const [busqueda, setBusqueda] = useState("");
    const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalRegistrar, setModalRegistrar] = useState(false);
    const [alerta, setAlerta] = useState(null);
    const [nuevoMedico, setNuevoMedico] = useState({
        nombre: "",
        rut: "",
        email: "",
        password: "",
        telefono: "",
        especialidad: "",
        universidad: "",
        experiencia: "",
        numeroRegistro: "",
        biografia: ""
    })

    useEffect(() => {
        if (!usuario?.id) return;
        setLoading(true);
        setError(null);

        const cargar = async () => {
            try {
                // Obtener todos los médicos registrados
                const medicosRes = await axios.get(`http://localhost:8081/usuarios/medicos`);
                const data = Array.isArray(medicosRes.data) ? medicosRes.data : [];
                setMedicos(data);
            } catch {
                setError("No se pudieron cargar los médicos.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [usuario?.id]);

    // Mostrar alerta de cuando se borra o se crea correctamente un médico.
    const mostrarAlerta = (tipo, mensaje) => {
        setAlerta({ tipo, mensaje, saliendo: false })
        setTimeout(() => {
            setAlerta(prev => prev ? { ...prev, saliendo: true } : null)
            setTimeout(() => setAlerta(null), 300)
        }, 2700)
    }


    const medicosFiltrados = medicos.filter((m) => {
        const q = busqueda.toLowerCase();
        return (
            m.nombre?.toLowerCase().includes(q) ||
            m.rut?.includes(busqueda) ||
            m.email?.toLowerCase().includes(q) ||
            m.especialidad?.toLowerCase().includes(q) ||
            m.numeroRegistro?.includes(busqueda) ||
            m.universidad?.toLowerCase().includes(q) ||
            m.experiencia?.includes(busqueda) ||
            m.direccion?.toLowerCase().includes(q) ||
            m.biografia?.toLowerCase().includes(q)
        );
    });

    const registrarMedico = async () => {
        try {
            const numeroRegistroAuto = `MED-${Date.now().toString().slice(-5)}`
            await axios.post("http://localhost:8081/usuarios/register", {
                ...nuevoMedico,
                rol: "MEDICO",
                numeroRegistro: numeroRegistroAuto
            })
            mostrarAlerta("primary", "Médico creado correctamente")
            setModalRegistrar(false);
            setNuevoMedico({
                nombre: "", rut: "", email: "", password: "",
                telefono: "", especialidad: "", universidad: "",
                experiencia: "", numeroRegistro: "", biografia: ""
            })
            const res = await axios.get(`http://localhost:8081/usuarios/medicos`)
            setMedicos(res.data)

        } catch (error) {
            alert("Error al registrar el médico")
            console.log(error)
        }
    }

    const eliminarMedico = async (id) => {
        if (!window.confirm("¿Estás seguro que deseas eliminar este médico?")) return
        try {
            await axios.delete(`http://localhost:8081/usuarios/medicos/${id}`)
            setMedicos(medicos.filter(m => m.id !== id))
            mostrarAlerta("primary", "Médico eliminado correctamente")
            setMedicoSeleccionado(null);
        } catch (error) {
            alert("Error al eliminar el médico")
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            {/* Alerta notificación */}
            {alerta && (
                <div className={`toast toast-end toast-bottom z-50 ${alerta.saliendo ? "toast-exit" : "toast-enter"}`}>
                    <div className={`alert shadow-lg`}>
                        <span>{alerta.mensaje}</span>
                    </div>
                </div>
            )}

            {/* HERO */}
            <section className="bg-primary px-6 py-10 sm:px-12 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    <span className="badge badge-warning text-info-content font-semibold">
                        Administrador
                    </span>
                    <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
                        Gestión de Médicos
                    </h1>
                    <p className="text-primary-content/70 text-base sm:text-lg">
                        Médicos registrados en el sistema.
                    </p>
                </div>
            </section>

            {/* CONTENIDO */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Stat */}
                <div className="stat bg-base-100 rounded-lg shadow-sm mb-8 w-fit">
                    <div className="stat-title">Médicos registrados</div>
                    <div className="stat-value text-primary text-center">{medicos.length}</div>
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
                                    placeholder="Buscar por nombre, RUT o email..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </label>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setModalRegistrar(true)}
                            >
                                + Registrar Médico
                            </button>
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
                                            <th>Nombre</th>
                                            <th>Rut</th>
                                            <th>Email</th>
                                            <th>Especialidad</th>
                                            <th>Universidad</th>
                                            <th>N° Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicosFiltrados.map((medico) => (
                                            <tr key={medico.id} className="hover">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar placeholder">
                                                            <div className="bg-primary/10 text-primary rounded-full w-10">
                                                                <span className="text-sm font-bold">{getIniciales(medico.nombre)}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{medico.nombre}</div>
                                                            <div className="text-sm opacity-50">{medico.rut}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-sm">{medico.rut}</td>
                                                <td className="text-sm">{medico.email || "—"}</td>
                                                <td className="text-sm">{medico.especialidad || "—"}</td>
                                                <td className="text-sm">{medico.universidad || "—"}</td>
                                                <td className="text-sm">{medico.numeroRegistro || "—"}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 w-24"
                                                        onClick={() => setMedicoSeleccionado(medico)}
                                                    >
                                                        Ver detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {medicosFiltrados.length === 0 && (
                                <div className="text-center py-8 text-base-content/50">
                                    {medicos.length === 0
                                        ? "No hay médicos registrados."
                                        : "No se encontraron médicos con esa búsqueda."}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal detalle */}
            {medicoSeleccionado && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-4">Ficha del Médico</h3>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="avatar placeholder">
                                <div className="bg-primary/10 text-primary rounded-full w-16">
                                    <span className="text-xl font-bold">{getIniciales(medicoSeleccionado.nombre)}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{medicoSeleccionado.nombre}</h4>
                                <p className="text-sm text-base-content/60">{medicoSeleccionado.rol}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">ID</span>
                                <span>{medicoSeleccionado.id || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">RUT</span>
                                <span>{medicoSeleccionado.rut || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Email</span>
                                <span>{medicoSeleccionado.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Teléfono</span>
                                <span>{medicoSeleccionado.telefono || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Rol</span>
                                <span>{medicoSeleccionado.rol}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Especialidad</span>
                                <span>{medicoSeleccionado.especialidad || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Universidad</span>
                                <span>{medicoSeleccionado.universidad || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Género</span>
                                <span>{medicoSeleccionado.genero || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Experiencia</span>
                                <span>{medicoSeleccionado.experiencia || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">N° Registro</span>
                                <span>{medicoSeleccionado.numeroRegistro || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Biografía</span>
                                <span className="text-right">{medicoSeleccionado.biografia || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-base-content/60">Registrado desde</span>
                                <span>
                                    {medicoSeleccionado.createdAt
                                        ? new Date(medicoSeleccionado.createdAt).toLocaleDateString()
                                        : "—"}
                                </span>
                            </div>
                        </div>


                        <div className="modal-action">
                            <button className="btn btn-sm btn-error transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => eliminarMedico(medicoSeleccionado.id)}>Eliminar</button>
                            <button className="btn btn-sm btn-primary transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" onClick={() => setMedicoSeleccionado(null)}>Cerrar</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setMedicoSeleccionado(null)}></div>
                </div>
            )}

            {/* Modal Crear Médico */}
            {modalRegistrar && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Registrar Médico</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Nombre completo</label>
                                <input className="input input-bordered w-full input-primary" placeholder="Dr. Juan Pérez" value={nuevoMedico.nombre} onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">RUT</label>
                                <input className="input input-bordered w-full input-primary" placeholder="12.345.678-9" value={nuevoMedico.rut} onChange={(e) => setNuevoMedico({ ...nuevoMedico, rut: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Email</label>
                                <input className="input input-bordered w-full input-primary" placeholder="doctor@mediflow.com" value={nuevoMedico.email} onChange={(e) => setNuevoMedico({ ...nuevoMedico, email: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Contraseña</label>
                                <input className="input input-bordered w-full input-primary" type="password" placeholder="••••••••" value={nuevoMedico.password} onChange={(e) => setNuevoMedico({ ...nuevoMedico, password: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Teléfono</label>
                                <input className="input input-bordered w-full input-primary" placeholder="912345678" value={nuevoMedico.telefono} onChange={(e) => setNuevoMedico({ ...nuevoMedico, telefono: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Especialidad</label>
                                <select className="select select-bordered w-full input-primary" value={nuevoMedico.especialidad} onChange={(e) => setNuevoMedico({ ...nuevoMedico, especialidad: e.target.value })}>
                                    <option value="">Selecciona...</option>
                                    <option>Medicina General</option>
                                    <option>Cardiología</option>
                                    <option>Dermatología</option>
                                    <option>Psicología</option>
                                    <option>Traumatología</option>
                                    <option>Neurología</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Universidad</label>
                                <input className="input input-bordered w-full input-primary" placeholder="Universidad de Chile" value={nuevoMedico.universidad} onChange={(e) => setNuevoMedico({ ...nuevoMedico, universidad: e.target.value })} />
                            </div>
                            <div className="col-span-2 flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Experiencia</label>
                                <input className="input input-bordered w-full input-primary" placeholder="10 años en cardiología clínica" value={nuevoMedico.experiencia} onChange={(e) => setNuevoMedico({ ...nuevoMedico, experiencia: e.target.value })} />
                            </div>
                            <div className="col-span-2 flex flex-col gap-1">
                                <label className="text-sm font-semibold text-base-content/70">Biografía</label>
                                <textarea className="textarea textarea-bordered w-full input-primary" rows={3} placeholder="Breve descripción profesional..." value={nuevoMedico.biografia} onChange={(e) => setNuevoMedico({ ...nuevoMedico, biografia: e.target.value })} />
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setModalRegistrar(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={registrarMedico}>Registrar</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setModalRegistrar(false)}></div>
                </div>
            )}

            <Footer />
        </div>
    );
}
