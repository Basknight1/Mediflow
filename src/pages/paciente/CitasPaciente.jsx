import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ConsultaDetalleModal from "../../components/ConsultaDetalleModal";
import { useAuth } from "../../context/AuthContext";

const estadoBadge = {
  CONFIRMADA: "badge-success",
  PENDIENTE: "badge-warning",
  CANCELADA: "badge-error",
  FINALIZADA: "badge-primary",
};

const estadoLabel = {
  CONFIRMADA: "Confirmada",
  PENDIENTE: "Pendiente",
  CANCELADA: "Cancelada",
  FINALIZADA: "Finalizada",
};

const filtros = [
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "FINALIZADA", label: "Finalizada" },
];

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const fecha = new Date(`${fechaStr}T00:00:00`);
  return fecha.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

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
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [pagando, setPagando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagosError, setPagosError] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState("Todas");

  useEffect(() => {
    const cargarCitas = async () => {
      if (!usuario?.id) return;

      try {
        setLoading(true);
        setError(null);
        setPagosError(null);

        const response = await axios.get(`http://localhost:8082/citas/paciente/${usuario.id}`);
        const citasBase = Array.isArray(response.data) ? response.data : [];

        const citasEnriquecidas = await Promise.all(
          citasBase.map(async (cita) => {
            const detallePromise =
              cita.estado === "FINALIZADA"
                ? axios
                    .get(
                      `http://localhost:8082/citas/registros-consulta/paciente/${usuario.id}/cita/${cita.id}`
                    )
                    .then((res) => res.data)
                    .catch((err) => {
                      if (err?.response?.status === 404 || err?.response?.status === 400) return null;
                      throw err;
                    })
                : Promise.resolve(null);

            try {
              const [medicoRes, registroConsulta] = await Promise.all([
                axios.get(`http://localhost:8081/usuarios/${cita.medicoId}`),
                detallePromise,
              ]);

              return {
                ...cita,
                doctorNombre: medicoRes.data.nombre,
                especialidad: medicoRes.data.especialidad || cita.tipo,
                registroConsulta,
              };
            } catch (err) {
              if (err?.response?.status && err.response.status !== 404) {
                console.error("No se pudo enriquecer la cita", err);
              }

              const registroConsulta = await detallePromise.catch(() => null);
              return {
                ...cita,
                doctorNombre: `Medico ID ${cita.medicoId}`,
                especialidad: cita.tipo,
                registroConsulta,
              };
            }
          })
        );

        citasEnriquecidas.sort((a, b) => {
          const fechaA = new Date(`${a.fecha}T${a.hora}`);
          const fechaB = new Date(`${b.fecha}T${b.hora}`);
          return fechaB - fechaA;
        });

        setCitas(citasEnriquecidas);

        try {
          const pagosRes = await axios.get(`http://localhost:8083/pagos/paciente/${usuario.id}`);
          const pagosIniciales = Array.isArray(pagosRes.data) ? pagosRes.data : [];
          const citasConCobroEsperado = citasEnriquecidas.filter(
            (cita) => cita.estado === "CONFIRMADA" || cita.estado === "FINALIZADA"
          );
          const citaIdsConPago = new Set(pagosIniciales.map((pago) => pago.citaId));
          const citasSinPago = citasConCobroEsperado.filter((cita) => !citaIdsConPago.has(cita.id));

          if (citasSinPago.length === 0) {
            setPagos(pagosIniciales);
          } else {
            const pagosGenerados = await Promise.all(
              citasSinPago.map((cita) =>
                axios
                  .post("http://localhost:8083/pagos", {
                    citaId: cita.id,
                    pacienteId: cita.pacienteId,
                    medicoId: cita.medicoId,
                    monto: 25000,
                    descripcion: `Consulta medica - ${cita.tipo}`,
                  })
                  .then((res) => res.data)
                  .catch((err) => {
                    console.error(`No se pudo generar el pago para la cita ${cita.id}`, err);
                    return null;
                  })
              )
            );

            const pagosConsolidados = [...pagosIniciales];
            pagosGenerados.filter(Boolean).forEach((pago) => {
              if (!pagosConsolidados.some((existente) => existente.citaId === pago.citaId)) {
                pagosConsolidados.push(pago);
              }
            });

            setPagos(pagosConsolidados);
          }
        } catch (err) {
          console.error("No se pudieron cargar los pagos", err);
          setPagos([]);
          setPagosError("No se pudieron cargar los pagos en este momento.");
        }
      } catch (err) {
        console.error("No se pudieron cargar las citas", err);
        setError("No se pudieron cargar las citas.");
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, [usuario?.id]);

  const realizarPago = async () => {
    if (!pagoSeleccionado) return;

    try {
      setPagando(true);
      const response = await axios.put(`http://localhost:8083/pagos/${pagoSeleccionado.id}/pagar`);
      setPagos((prev) => prev.map((pago) => (pago.id === pagoSeleccionado.id ? response.data : pago)));
      setPagoSeleccionado(null);
    } catch (err) {
      console.error("Error al realizar el pago", err);
    } finally {
      setPagando(false);
    }
  };

  const obtenerPagoDeCita = (citaId) => pagos.find((pago) => pago.citaId === citaId) || null;

  const citasFiltradas =
    filtroActivo === "Todas" ? citas : citas.filter((cita) => cita.estado === filtroActivo);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <section className="bg-primary px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <span className="badge badge-success text-success-content font-semibold">Paciente</span>

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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2 mb-2">
            <p className="text-sm text-gray-500 font-semibold">Filtrar por estado</p>
            <div className="filter flex flex-wrap gap-2">
              {filtroActivo !== "Todas" && (
                <button className="btn btn-sm btn-square" type="button" onClick={() => setFiltroActivo("Todas")}>
                  ×
                </button>
              )}
              {filtros.map((filtro) => (
                <button
                  key={filtro.value}
                  type="button"
                  className={`btn btn-sm ${filtroActivo === filtro.value ? "btn-primary" : "btn-outline btn-primary"}`}
                  onClick={() => setFiltroActivo(filtro.value)}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>

          {pagosError && !error && (
            <div className="alert alert-warning">
              <span>{pagosError}</span>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              Historial de Citas
            </h2>

            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : error ? (
                <div className="alert alert-error">
                  <span>{error}</span>
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
                    <button className="btn btn-primary btn-sm mt-2" onClick={() => navigate("/paciente/agendar")}>
                      Agendar una cita
                    </button>
                  </div>
                </div>
              ) : (
                citasFiltradas.map((cita) => {
                  const pago = obtenerPagoDeCita(cita.id);

                  return (
                    <div
                      key={cita.id}
                      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="card-body p-4 sm:p-5 flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="bg-base-200 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                            <span className="text-xl">🩺</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base-content truncate">{cita.doctorNombre}</p>
                            <p className="text-sm text-base-content/60">{cita.especialidad}</p>
                          </div>

                          <div className="text-left sm:text-right shrink-0 flex flex-col sm:items-end gap-1">
                            <span className="text-xs text-base-content/60">
                              {formatearFecha(cita.fecha)} · {formatearHora(cita.hora)}
                            </span>
                            <span className={`badge badge-sm ${estadoBadge[cita.estado]}`}>
                              {estadoLabel[cita.estado]}
                            </span>
                          </div>
                        </div>

                        {cita.estado === "FINALIZADA" && cita.registroConsulta && (
                          <>
                            <div className="divider my-0"></div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm text-base-content/70">
                                Ya puedes revisar el detalle de esta atencion.
                              </span>
                              <button
                                className="btn btn-outline btn-primary btn-xs"
                                onClick={() => setDetalleSeleccionado(cita)}
                              >
                                Ver detalle
                              </button>
                            </div>
                          </>
                        )}

                        {pago && (cita.estado === "CONFIRMADA" || cita.estado === "FINALIZADA") && (
                          <>
                            <div className="divider my-0"></div>
                            <div className="flex items-center justify-between gap-3">
                              {pago.estado === "PAGADO" ? (
                                <>
                                  <span className="text-sm text-success font-semibold">Pago completado</span>
                                  <button
                                    className="btn btn-outline btn-primary btn-xs"
                                    onClick={() => setBoletaSeleccionada(pago)}
                                  >
                                    Ver boleta
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm text-warning font-semibold">Pago pendiente</span>
                                  <button
                                    className="btn btn-warning btn-xs"
                                    onClick={() => setPagoSeleccionado(pago)}
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
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {detalleSeleccionado?.registroConsulta && (
        <ConsultaDetalleModal
          cita={detalleSeleccionado}
          registro={detalleSeleccionado.registroConsulta}
          doctorNombre={detalleSeleccionado.doctorNombre}
          especialidad={detalleSeleccionado.especialidad}
          onClose={() => setDetalleSeleccionado(null)}
        />
      )}

      {pagoSeleccionado && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4">Pagar Consulta</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">N° Boleta</span>
                <span>{pagoSeleccionado.numeroBoleta}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-base-content/60">Descripcion</span>
                <span className="text-right">{pagoSeleccionado.descripcion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Monto</span>
                <span className="font-bold text-lg">${pagoSeleccionado.monto?.toLocaleString("es-CL")}</span>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setPagoSeleccionado(null)}>
                Cancelar
              </button>
              <button className="btn btn-success text-white" onClick={realizarPago} disabled={pagando}>
                {pagando ? <span className="loading loading-spinner loading-sm"></span> : "Confirmar pago"}
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
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-base-content/60">Descripcion</span>
                <span className="text-right">{boletaSeleccionada.descripcion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Monto</span>
                <span className="font-bold text-lg text-success">
                  ${boletaSeleccionada.monto?.toLocaleString("es-CL")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Fecha pago</span>
                <span>{boletaSeleccionada.fechaPago?.split("-").reverse().join("/")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-base-content/60">Estado</span>
                <span className="badge badge-sm badge-success">Pagado</span>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-primary btn-sm" onClick={() => setBoletaSeleccionada(null)}>
                Cerrar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setBoletaSeleccionada(null)}></div>
        </div>
      )}

      <Footer />
    </div>
  );
}
