import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

/* ─── Mapeo estado → clases DaisyUI ─── */
const estadoBadge = {
  CONFIRMADA: "badge-success",
  PENDIENTE: "badge-warning",
  CANCELADA: "badge-error",
  FINALIZADA: "badge-primary",
};

/* ─── Etiquetas legibles ─── */
const estadoLabel = {
  CONFIRMADA: "Confirmada",
  PENDIENTE: "Pendiente",
  CANCELADA: "Cancelada",
  FINALIZADA: "Finalizada",
};

/* ─── Formatear fecha legible ─── */
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const fecha = new Date(fechaStr + "T00:00:00");
  return fecha.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

/* ─── Formatear hora (quitar segundos) ─── */
const formatearHora = (horaStr) => {
  if (!horaStr) return "";
  return horaStr.substring(0, 5);
};

export default function CitasPaciente() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [pagando, setPagando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null)
  const [error, setError] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState("Todas");

  useEffect(() => {
    const cargarCitas = async () => {
      if (!usuario?.id) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8082/citas/paciente/${usuario.id}`
        );

        const pagosRes = await axios.get(`http://localhost:8083/pagos/paciente/${usuario.id}`)
        setPagos(Array.isArray(pagosRes.data) ? pagosRes.data : [])

        const citasEnriquecidas = await Promise.all(
          response.data.map(async (cita) => {
            try {
              const medicoRes = await axios.get(`http://localhost:8081/usuarios/${cita.medicoId}`)
              return {
                ...cita,
                doctorNombre: medicoRes.data.nombre,
                especialidad: medicoRes.data.especialidad
              }
            } catch {
              return {
                ...cita,
                doctorNombre: `Médico ID ${cita.medicoId}`,
                especialidad: cita.tipo
              }
            }
          })
        )

        citasEnriquecidas.sort((a, b) => {
          const fechaA = new Date(a.fecha + "T" + a.hora)
          const fechaB = new Date(b.fecha + "T" + b.hora)
          return fechaB - fechaA
        })

        setCitas(citasEnriquecidas)
      } catch (err) {
        setError("No se pudieron cargar las citas.")
      } finally {
        setLoading(false)
      }
    }
    cargarCitas()
  }, [usuario])

  // Poder realizar los pagos de las boletas que están en "PENDIENTE"
  const realizarPago = async () => {
    if (!pagoSeleccionado) return
    try {
      setPagando(true)
      await axios.put(`http://localhost:8083/pagos/${pagoSeleccionado.id}/pagar`)
      setPagos(pagos.map(p =>
        p.id === pagoSeleccionado.id
          ? { ...p, estado: 'PAGADO' }
          : p
      ))
      setPagoSeleccionado(null)
    } catch (error) {
      console.error("Error al realizar el pago", error)
    } finally {
      setPagando(false)
    }
  }

  const obtenerPagoDeCita = (citaId) => {
    return pagos.find(p => p.citaId === citaId) || null
  }

  // Filtrar según el filtro activo
  const citasFiltradas =
    filtroActivo === "Todas"
      ? citas
      : citas.filter((cita) => cita.estado === filtroActivo);

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
            Mis Citas
          </h1>

          <p className="text-primary-content/70 text-base sm:text-lg mb-8">
            {loading
              ? "Cargando..."
              : `Tienes ${citas.length} cita${citas.length !== 1 ? "s" : ""} en total.`}
          </p>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Grid: Citas + Sidebar ── */}
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* -- Filtros -- */}
          <div className="flex flex-col gap-2 mb-6">
            <p className="text-sm text-gray-500 font-semibold">Filtrar por estado</p>
            <div className="filter">
              {filtroActivo !== "Todas" && (
                <input
                  className="btn btn-square"
                  type="reset"
                  value="×"
                  onClick={() => setFiltroActivo("Todas")}
                />
              )}
              <input
                className="btn btn-primary"
                type="radio"
                name="filtro"
                aria-label="Confirmada"
                checked={filtroActivo === "CONFIRMADA"}
                onChange={() => setFiltroActivo("CONFIRMADA")}
              />
              <input
                className="btn btn-primary"
                type="radio"
                name="filtro"
                aria-label="Pendiente"
                checked={filtroActivo === "PENDIENTE"}
                onChange={() => setFiltroActivo("PENDIENTE")}
              />
              <input
                className="btn btn-primary"
                type="radio"
                name="filtro"
                aria-label="Cancelada"
                checked={filtroActivo === "CANCELADA"}
                onChange={() => setFiltroActivo("CANCELADA")}
              />
            </div>
          </div>


          {/* ── COLUMNA IZQUIERDA: Historial de Citas ── */}
          <div className="">
            <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              📅 Historial de Citas
            </h2>

            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : error ? (
                <div className="alert alert-error">
                  <span>⚠️ {error}</span>
                </div>
              ) : citasFiltradas.length === 0 ? (
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body items-center text-center py-8">
                    <span className="text-4xl mb-2">📭</span>
                    <p className="text-base-content/60">
                      {filtroActivo === "Todas"
                        ? "No tienes citas registradas."
                        : `No tienes citas con estado "${estadoLabel[filtroActivo]}".`}
                    </p>
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => navigate("/paciente/agendar")}
                    >
                      Agendar una cita
                    </button>
                  </div>
                </div>
              ) : (
                citasFiltradas.map((cita) => (
                  <div
                    key={cita.id}
                    className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="card-body p-4 sm:p-5 flex-col gap-3">
                      {/* Fila principal */}
                      <div className="flex-row flex items-center gap-4">
                        {/* Icono */}
                        <div className="bg-base-200 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                          <span className="text-xl">🩺</span>
                        </div>

                        {/* Info del doctor */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base-content truncate">{cita.doctorNombre}</p>
                          <p className="text-sm text-base-content/60">{cita.especialidad}</p>
                        </div>

                        {/* Fecha + Badge estado */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs text-base-content/60">
                            {formatearFecha(cita.fecha)} · {formatearHora(cita.hora)}
                          </span>
                          <span className={`badge badge-sm ${estadoBadge[cita.estado]}`}>
                            {estadoLabel[cita.estado]}
                          </span>
                        </div>
                      </div>

                      {/* Fila de pago solo si está confirmada y tiene pago */}
                      {(cita.estado === 'CONFIRMADA' || cita.estado === 'FINALIZADA') && obtenerPagoDeCita(cita.id) && (
                        <>
                          <div className="divider my-0"></div>
                          <div className="flex items-center justify-between">
                            {obtenerPagoDeCita(cita.id).estado === 'PAGADO' ? (
                              <>
                                <span className="text-sm text-success font-semibold flex items-center gap-1">
                                  ✓ Pago completado
                                </span>
                                <button
                                  className="btn btn-outline btn-primary btn-xs transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
                                  onClick={() => setBoletaSeleccionada(obtenerPagoDeCita(cita.id))}
                                >
                                  Ver boleta
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-warning font-semibold flex items-center gap-1">
                                  Pago pendiente
                                </span>
                                <button
                                  className="btn btn-warning btn-xs transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
                                  onClick={() => setPagoSeleccionado(obtenerPagoDeCita(cita.id))}
                                >
                                  Pagar boleta
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </main>

      {pagoSeleccionado && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4">Pagar Consulta</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">N° Boleta</span>
                <span>{pagoSeleccionado.numeroBoleta}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Descripción</span>
                <span>{pagoSeleccionado.descripcion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Monto</span>
                <span className="font-bold text-lg">${pagoSeleccionado.monto?.toLocaleString('es-CL')}</span>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setPagoSeleccionado(null)}>Cancelar</button>
              <button
                className="btn btn-success text-white transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
                onClick={realizarPago}
                disabled={pagando}
              >
                {pagando ? <span className="loading loading-spinner loading-sm"></span> : '✓ Confirmar Pago'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPagoSeleccionado(null)}></div>
        </div>
      )}
      {boletaSeleccionada && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4">Boleta de Pago</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">N° Boleta</span>
                <span className="font-bold">{boletaSeleccionada.numeroBoleta}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Descripción</span>
                <span>{boletaSeleccionada.descripcion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Monto</span>
                <span className="font-bold text-lg text-success">${boletaSeleccionada.monto?.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Fecha pago</span>
                <span>{boletaSeleccionada.fechaPago?.split('-').reverse().join('/')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Estado</span>
                <span className="badge badge-sm badge-success">Pagado</span>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-primary btn-sm" onClick={() => setBoletaSeleccionada(null)}>Cerrar</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setBoletaSeleccionada(null)}></div>
        </div>
      )}
    </div>
  );
}