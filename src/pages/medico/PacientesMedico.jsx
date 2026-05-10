import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import AvatarDefault from "../../assets/avatar-default.png"

function getIniciales(nombre) {
  return (nombre || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-CL");
}

function formatTipo(tipo) {
  if (!tipo) return "—";
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

export default function PacientesMedico() {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [pacienteDetalle, setPacienteDetalle] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario?.id) return;
    setLoading(true);
    setError(null);

    const cargar = async () => {
      try {
        const citasRes = await axios.get(`http://localhost:8082/citas/medico/${usuario.id}`);
        const citas = Array.isArray(citasRes.data) ? citasRes.data : [];
        const citasVigentes = citas.filter((cita) => cita.estado !== "CANCELADA");
        const citasPorPaciente = new Map();

        citasVigentes.forEach((cita) => {
          const actual = citasPorPaciente.get(cita.pacienteId);
          const actualFechaHora = actual ? `${actual.fecha}T${actual.hora}` : "";
          const nuevaFechaHora = `${cita.fecha}T${cita.hora}`;
          if (!actual || nuevaFechaHora > actualFechaHora) {
            citasPorPaciente.set(cita.pacienteId, cita);
          }
        });

        const pacienteIds = [...citasPorPaciente.keys()];
        const resultados = await Promise.all(
          pacienteIds.map(async (id) => {
            try {
              const [pacienteRes, registroRes] = await Promise.all([
                axios.get(`http://localhost:8081/usuarios/${id}`),
                axios
                  .get(`http://localhost:8082/citas/registros-consulta/paciente/${id}/medico/${usuario.id}`)
                  .catch((err) => {
                    if (err?.response?.status === 404) return { data: null };
                    throw err;
                  }),
              ]);

              return {
                ...pacienteRes.data,
                citaActual: citasPorPaciente.get(id) || null,
                registroConsulta: registroRes.data,
              };
            } catch {
              return null;
            }
          })
        );

        setPacientes(
          resultados
            .filter(Boolean)
            .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
        );
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
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <section className="bg-primary px-6 py-10 sm:px-12 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-info text-info-content font-semibold">Médico</span>
          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Mis Pacientes
          </h1>
          <p className="text-primary-content/70 text-base sm:text-lg">
            Revisa la información básica del paciente y el detalle registrado de sus citas finalizadas.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="stat bg-base-100 rounded-lg shadow-sm mb-8 w-fit">
          <div className="stat-title">Total de pacientes</div>
          <div className="stat-value text-primary text-center">{pacientes.length}</div>
        </div>

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

        {!loading && !error && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Paciente</th>
                      <th>Última cita</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesFiltrados.map((paciente) => (
                      <tr key={paciente.id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary/10 text-primary rounded-full w-10">
                                <img src={AvatarDefault} alt="Avatar usuario" />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{paciente.nombre}</div>
                              <div className="text-sm opacity-50">{paciente.rut}</div>
                              {paciente.registroConsulta && (
                                <button
                                  className="link link-primary text-sm mt-1"
                                  onClick={() => setPacienteDetalle(paciente)}
                                >
                                  Ver detalles
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-sm">
                          <div className="font-medium">{formatFecha(paciente.citaActual?.fecha)}</div>
                          <div className="opacity-60">{formatTipo(paciente.citaActual?.tipo)}</div>
                        </td>
                        <td className="text-sm">{paciente.email}</td>
                        <td className="text-sm">{paciente.telefono || "—"}</td>
                        <td className="text-sm">
                          {paciente.registroConsulta ? (
                            <span className="badge badge-success badge-outline">Disponible</span>
                          ) : (
                            <span className="badge badge-ghost">Sin registro</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pacientesFiltrados.length === 0 && (
                <div className="text-center py-8 text-base-content/50">
                  {pacientes.length === 0
                    ? "Aún no tienes pacientes con citas registradas."
                    : "No se encontraron pacientes con esa búsqueda."}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {pacienteDetalle?.registroConsulta && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-xl mb-4">Detalle del Registro</h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="avatar placeholder">
                <div className="bg-primary/10 text-primary rounded-full w-16">
                  <span className="text-xl font-bold">{getIniciales(pacienteDetalle.nombre)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg">{pacienteDetalle.nombre}</h4>
                <p className="text-sm text-base-content/60">{pacienteDetalle.email}</p>
                <p className="text-sm text-base-content/60">{pacienteDetalle.telefono || "Sin teléfono"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60 mb-1">Fecha de la cita</p>
                <p className="font-semibold">{formatFecha(pacienteDetalle.registroConsulta.fechaCita)}</p>
              </div>
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60 mb-1">Tipo de cita</p>
                <p className="font-semibold">{formatTipo(pacienteDetalle.registroConsulta.tipoCita)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60 mb-1">Motivo de consulta</p>
                <p>{pacienteDetalle.registroConsulta.motivoConsulta || "Sin motivo registrado"}</p>
              </div>
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60 mb-1">Observaciones</p>
                <p>{pacienteDetalle.registroConsulta.observaciones || "Sin observaciones"}</p>
              </div>
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60 mb-1">Diagnóstico o resumen</p>
                <p>{pacienteDetalle.registroConsulta.diagnostico || "Sin diagnóstico"}</p>
              </div>
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60 mb-1">Indicaciones</p>
                <p>{pacienteDetalle.registroConsulta.indicaciones || "Sin indicaciones"}</p>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setPacienteDetalle(null)}>
                Cerrar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPacienteDetalle(null)}></div>
        </div>
      )}

      <Footer />
    </div>
  );
}
