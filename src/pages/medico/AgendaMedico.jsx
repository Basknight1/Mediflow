import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { api } from "../../config/api";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import AvatarDefault from "../../assets/avatar-default.png"

/* ─── Mapeo estado → clases DaisyUI ─── */
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

const filtrosEstadoCitas = [
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "FINALIZADA", label: "Finalizada" },
];

/* ─── Iniciales del nombre para avatar ─── */
function getIniciales(nombre) {
  return (nombre || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatFechaLabel(fechaStr) {
  const fecha = new Date(`${fechaStr}T00:00:00`);
  return fecha.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
}

function formatFecha(fechaStr) {
  if (!fechaStr) return "—";
  return new Date(`${fechaStr}T00:00:00`).toLocaleDateString("es-CL");
}

function formatTipo(tipo) {
  if (!tipo) return "—";
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

function agruparPorFecha(citas) {
  const grupos = {};
  citas.forEach((cita) => {
    if (!grupos[cita.fecha]) grupos[cita.fecha] = [];
    grupos[cita.fecha].push(cita);
  });
  Object.values(grupos).forEach((g) => g.sort((a, b) => a.hora.localeCompare(b.hora)));
  return grupos;
}

function getErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  return fallback;
}

// Espera unos segundos para mostrar la animación de carga al crear una cita.
function esperarAnim() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function IconoCarga({ className }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export default function AgendaMedico() {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState([]);
  const [nombresPacientes, setNombresPacientes] = useState({});
  const [pagosPorCita, setPagosPorCita] = useState({});
  const [erroresPagoPorCita, setErroresPagoPorCita] = useState({});
  const [filtroActivo, setFiltroActivo] = useState("Todas");
  const [cargando, setCargando] = useState(false);
  const [guardandoRegistro, setGuardandoRegistro] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [citaParaFinalizar, setCitaParaFinalizar] = useState(null);
  const [mostrarConfirmacionFinal, setMostrarConfirmacionFinal] = useState(false);
  const [formErrors, setFormErrors] = useState({
    observaciones: "",
    diagnostico: "",
  });
  const [formData, setFormData] = useState({
    observaciones: "",
    diagnostico: "",
    indicaciones: "",
  });

  /**
   * Cita en la que se está cambiando estado desde la lista + destino (para mostrar el texto solo en el botón correcto).
   */
  const [accionEstadoEnCurso, setAccionEstadoEnCurso] = useState(null);
  const envioEnCursoRef = useRef(false);

  useEffect(() => {
    if (!usuario?.id) return;
    setCargando(true);

    const cargarCitas = async () => {
      try {
        const res = await api.get(`/citas/medico/${usuario.id}`);
        const citasCargadas = Array.isArray(res.data) ? res.data : [];
        setCitas(citasCargadas);

        const ids = [...new Set(citasCargadas.map((c) => c.pacienteId))];
        const nombres = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await api.get(`/usuarios/${id}`);
              nombres[id] = r.data.nombre;
            } catch {
              nombres[id] = `Paciente #${id}`;
            }
          })
        );
        setNombresPacientes(nombres);

        const citasConPago = citasCargadas.filter(
          (cita) => cita.estado === "CONFIRMADA" || cita.estado === "FINALIZADA"
        );
        const pagosMap = {};
        const erroresMap = {};

        await Promise.all(
          citasConPago.map(async (cita) => {
            try {
              const pagoRes = await api.get(`/pagos/cita/${cita.id}`);
              pagosMap[cita.id] = pagoRes.data;
            } catch (err) {
              if (err?.response?.status === 404) {
                pagosMap[cita.id] = null;
              } else {
                erroresMap[cita.id] = "No se pudo verificar el pago de esta cita.";
              }
            }
          })
        );

        setPagosPorCita(pagosMap);
        setErroresPagoPorCita(erroresMap);
      } catch {
        setError("No se pudieron cargar las citas.");
      } finally {
        setCargando(false);
      }
    };

    cargarCitas();
  }, [usuario?.id]);

  // Hacemos la comunicación con el backend y le insertamos los datos
  // que uno elige en el frontend para ponerlos en el backend Citas.
  const cambiarEstado = async (citaId, nuevoEstado) => {
    if (envioEnCursoRef.current) return
    envioEnCursoRef.current = true
    setAccionEstadoEnCurso({ citaId, nuevoEstado })
    try {
      const res = await api.put(
        `/citas/${citaId}/estado?nuevoEstado=${nuevoEstado}`
      )
      setCitas((prev) => prev.map((c) => (c.id === citaId ? res.data : c)))

      if (nuevoEstado === "CONFIRMADA") {
        try {
          const pagoRes = await api.get(`/pagos/cita/${citaId}`)
          setPagosPorCita((prev) => ({ ...prev, [citaId]: pagoRes.data }))
          setErroresPagoPorCita((prev) => {
            const next = { ...prev }
            delete next[citaId]
            return next
          })
        } catch (err) {
          if (err?.response?.status === 404) {
            setPagosPorCita((prev) => ({ ...prev, [citaId]: null }))
          } else {
            setErroresPagoPorCita((prev) => ({
              ...prev,
              [citaId]: "No se pudo verificar el pago de esta cita.",
            }))
          }
        }
      }
    } catch {
      alert("No se pudo actualizar el estado.")
    } finally {
      envioEnCursoRef.current = false
      setAccionEstadoEnCurso(null)
    }
  }

  const abrirModalFinalizacion = async (cita) => {
    setMensaje(null);
    setError(null);
    setMostrarConfirmacionFinal(false);
    setFormErrors({
      observaciones: "",
      diagnostico: "",
    });

    let registroExistente = null;
    try {
      const res = await api.get(`/registros-consulta/cita/${cita.id}`);
      registroExistente = res.data;
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError("No se pudo preparar el registro de consulta.");
        return;
      }
    }

    setCitaParaFinalizar(cita);
    setFormData({
      observaciones: registroExistente?.observaciones || "",
      diagnostico: registroExistente?.diagnostico || "",
      indicaciones: registroExistente?.indicaciones || "",
    });
  };

  const cerrarModalFinalizacion = () => {
    if (guardandoRegistro) return;
    setCitaParaFinalizar(null);
    setMostrarConfirmacionFinal(false);
    setFormErrors({
      observaciones: "",
      diagnostico: "",
    });
    setFormData({
      observaciones: "",
      diagnostico: "",
      indicaciones: "",
    });
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "observaciones" || field === "diagnostico") {
      setFormErrors((prev) => ({
        ...prev,
        [field]: value.trim() ? "" : prev[field],
      }));
    }
  };

  const validarFormulario = () => {
    const errores = {
      observaciones: formData.observaciones.trim()
        ? ""
        : "Debe ingresar las observaciones de la atención.",
      diagnostico: formData.diagnostico.trim()
        ? ""
        : "Debe ingresar un diagnóstico o resumen clínico.",
    };

    setFormErrors(errores);
    return !errores.observaciones && !errores.diagnostico;
  };

  const puedeFinalizar = formData.observaciones.trim() && formData.diagnostico.trim();

  const solicitarConfirmacionFinal = () => {
    if (!validarFormulario()) return;
    setMostrarConfirmacionFinal(true);
  };

  const finalizarConRegistro = () => {
    if (!citaParaFinalizar) return;

    flushSync(() => {
      setGuardandoRegistro(true);
      setError(null);
    });

    void (async () => {
      try {
        await esperarAnim();

        await api.post("/registros-consulta", {
          citaId: citaParaFinalizar.id,
          pacienteId: citaParaFinalizar.pacienteId,
          medicoId: citaParaFinalizar.medicoId,
          observaciones: formData.observaciones.trim(),
          diagnostico: formData.diagnostico.trim(),
          indicaciones: formData.indicaciones.trim(),
        });

        const res = await api.put(
          `/citas/${citaParaFinalizar.id}/estado?nuevoEstado=FINALIZADA`
        );

        setCitas((prev) => prev.map((c) => (c.id === citaParaFinalizar.id ? res.data : c)));
        setMensaje("La cita fue finalizada y el registro quedó guardado.");
        cerrarModalFinalizacion();
      } catch (err) {
        setError(getErrorMessage(err, "No se pudo finalizar la cita con el registro."));
      } finally {
        setGuardandoRegistro(false);
      }
    })();
  };

  const citasFiltradas = filtroActivo === "Todas" ? citas : citas.filter((c) => c.estado === filtroActivo);
  const citasAgrupadas = agruparPorFecha(citasFiltradas);
  const fechasOrdenadas = Object.keys(citasAgrupadas).sort();

  const hoy = new Date().toISOString().split("T")[0];
  const citasHoy = citas.filter((c) => c.fecha === hoy);
  const confirmadas = citasHoy.filter((c) => c.estado === "CONFIRMADA").length;
  const pendientes = citasHoy.filter((c) => c.estado === "PENDIENTE").length;
  const canceladas = citasHoy.filter((c) => c.estado === "CANCELADA").length;

  const ocupadoActualizandoEstado = accionEstadoEnCurso !== null;
  const ocupadoGuardandoFinal = guardandoRegistro;
  const mostrarOverlayAccion = ocupadoActualizandoEstado || ocupadoGuardandoFinal;

  return (
    <div className="min-h-screen bg-base-200">
      {mostrarOverlayAccion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/40 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-4 rounded-box border border-base-300 bg-base-100 px-8 py-5 shadow-2xl">
            <IconoCarga className="h-10 w-10 text-primary" />
            <span className="text-lg font-semibold text-base-content">
              {ocupadoGuardandoFinal ? "Guardando y finalizando…" : "Actualizando la cita…"}
            </span>
          </div>
        </div>
      )}
      <Navbar />

      <section className="bg-primary px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <span className="badge badge-info text-info-content font-semibold">Médico</span>
          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Mi Agenda
          </h1>
          <p className="text-primary-content/70 text-base sm:text-lg mb-6">
            Gestiona tus citas y registra la atención antes de finalizarlas.
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{citasHoy.length}</span>
              <span className="text-sm ml-2 opacity-70">Cita(s) hoy</span>
            </div>
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{confirmadas}</span>
              <span className="text-sm ml-2 opacity-70">Confirmada(s)</span>
            </div>
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{pendientes}</span>
              <span className="text-sm ml-2 opacity-70">Pendiente(s)</span>
            </div>
            {canceladas > 0 && (
              <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
                <span className="text-2xl font-bold">{canceladas}</span>
                <span className="text-sm ml-2 opacity-70">Canceladas</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {mensaje && (
            <div className="alert alert-success">
              <span>{mensaje}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 mb-2">
            <p className="text-sm text-gray-500 font-semibold">Filtrar por estado</p>
            <div className="filter flex flex-wrap gap-2">
              {filtroActivo !== "Todas" && (
                <button
                  type="button"
                  className="btn btn-sm btn-square"
                  onClick={() => setFiltroActivo("Todas")}
                >
                  ×
                </button>
              )}
              {filtrosEstadoCitas.map((filtro) => (
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

          {cargando && (
            <div className="text-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/50 mt-3">Cargando citas...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {!cargando && !error && fechasOrdenadas.map((fecha) => {
            const grupo = citasAgrupadas[fecha];
            const esHoy = fecha === hoy;

            return (
              <div key={fecha}>
                <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                  {esHoy ? "Citas de hoy" : formatFechaLabel(fecha)}
                  <span className="badge badge-ghost badge-sm">
                    {grupo.length} {grupo.length === 1 ? "cita" : "citas"}
                  </span>
                </h2>

                <div className="flex flex-col gap-3">
                  {grupo.map((cita) => {
                    const nombrePaciente = nombresPacientes[cita.pacienteId] || `Paciente #${cita.pacienteId}`;
                    const pago = pagosPorCita[cita.id];
                    const errorPago = erroresPagoPorCita[cita.id];
                    const puedeFinalizarCita = pago?.estado === "PAGADO" && !errorPago;
                    const mensajeBloqueoPago = errorPago
                      ? errorPago
                      : pago === null || pago === undefined
                        ? "El paciente debe pagar la cita antes de finalizarla."
                        : pago.estado !== "PAGADO"
                          ? "El paciente debe pagar la cita antes de finalizarla."
                          : null;
                    return (
                      <div key={cita.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="card-body p-4 sm:p-5">
                          <div className="flex-row flex items-center gap-4">
                            <div className="bg-primary/10 text-primary rounded-xl w-12 h-12 flex items-center justify-center shrink-0 font-bold text-sm">
                              <img src={AvatarDefault} alt="Avatar usuario" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-base-content truncate">{nombrePaciente}</p>
                              <p className="text-sm text-base-content/60">{cita.motivo || "Sin motivo"}</p>
                            </div>

                            <span className={`badge badge-sm ${estadoBadge[cita.estado]}`}>
                              {estadoLabel[cita.estado]}
                            </span>
                          </div>

                          {cita.estado === "PENDIENTE" && (
                            <div className="flex gap-2 mt-3 justify-end">
                              <button
                                type="button"
                                className="btn btn-success btn-xs min-w-28 gap-1"
                                onClick={() => cambiarEstado(cita.id, "CONFIRMADA")}
                                disabled={ocupadoActualizandoEstado}
                                aria-busy={
                                  accionEstadoEnCurso?.citaId === cita.id &&
                                  accionEstadoEnCurso?.nuevoEstado === "CONFIRMADA"
                                }
                              >
                                {accionEstadoEnCurso?.citaId === cita.id &&
                                  accionEstadoEnCurso?.nuevoEstado === "CONFIRMADA" ? (
                                  <>
                                    <IconoCarga className="h-4 w-4 shrink-0 text-success-content" />
                                    Confirmando…
                                  </>
                                ) : (
                                  "Confirmar"
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-error btn-xs min-w-28 gap-1"
                                onClick={() => cambiarEstado(cita.id, "CANCELADA")}
                                disabled={ocupadoActualizandoEstado}
                              >
                                {accionEstadoEnCurso?.citaId === cita.id &&
                                  accionEstadoEnCurso?.nuevoEstado === "CANCELADA" ? (
                                  <>
                                    <IconoCarga className="h-4 w-4 shrink-0 text-error-content" />
                                    Cancelando…
                                  </>
                                ) : (
                                  "Cancelar"
                                )}
                              </button>
                            </div>
                          )}

                          {cita.estado === "CONFIRMADA" && (
                            <div className="mt-3 flex flex-col gap-2">
                              {mensajeBloqueoPago && (
                                <p className="text-sm text-warning">{mensajeBloqueoPago}</p>
                              )}
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  className="btn btn-neutral btn-xs disabled:btn-disabled"
                                  onClick={() => abrirModalFinalizacion(cita)}
                                  disabled={!puedeFinalizarCita || ocupadoActualizandoEstado}
                                >
                                  Finalizar cita
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-error btn-xs min-w-28 gap-1"
                                  onClick={() => cambiarEstado(cita.id, "CANCELADA")}
                                  disabled={ocupadoActualizandoEstado}
                                >
                                  {accionEstadoEnCurso?.citaId === cita.id &&
                                    accionEstadoEnCurso?.nuevoEstado === "CANCELADA" ? (
                                    <>
                                      <IconoCarga className="h-4 w-4 shrink-0 text-error-content" />
                                      Cancelando…
                                    </>
                                  ) : (
                                    "Cancelar"
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!cargando && !error && fechasOrdenadas.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              <span className="text-4xl mb-3 block">📭</span>
              <p className="font-semibold">
                {filtroActivo === "Todas"
                  ? "No tienes citas registradas"
                  : `No tienes citas con estado "${estadoLabel[filtroActivo]}".`}
              </p>
              <p className="text-sm">{filtroActivo !== "Todas" && "Prueba con otro filtro."}</p>
            </div>
          )}
        </div>
      </main>

      {citaParaFinalizar && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex flex-col gap-5">
              <div className="border-b border-base-300 px-5 py-5 sm:px-7">
                <div>
                  <h3 className="text-2xl font-bold text-base-content">Registro de Consulta</h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    Completa el detalle de la atención antes de finalizar la cita.
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-7 sm:pb-7">
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-base-200 p-4">
                      <p className="mb-1 text-sm font-semibold text-base-content/60">Paciente</p>
                      <p className="font-semibold text-base-content">
                        {nombresPacientes[citaParaFinalizar.pacienteId] || `Paciente #${citaParaFinalizar.pacienteId}`}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-base-200 p-4">
                      <p className="mb-1 text-sm font-semibold text-base-content/60">Fecha</p>
                      <p className="font-semibold text-base-content">{formatFecha(citaParaFinalizar.fecha)}</p>
                    </div>

                    <div className="rounded-2xl bg-base-200 p-4">
                      <p className="mb-1 text-sm font-semibold text-base-content/60">Tipo de cita</p>
                      <p className="font-semibold text-base-content">{formatTipo(citaParaFinalizar.tipo)}</p>
                    </div>

                    <div className="rounded-2xl bg-base-200 p-4">
                      <p className="mb-1 text-sm font-semibold text-base-content/60">Médico</p>
                      <p className="font-semibold text-base-content">{usuario?.nombre || "Médico"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-base-content">Motivo de consulta</span>
                    <textarea
                      className="textarea textarea-bordered min-h-[110px] w-full resize-none bg-base-200"
                      value={citaParaFinalizar.motivo || "Sin motivo registrado"}
                      readOnly
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-base-content">
                      Observaciones <span className="text-error">*</span>
                    </span>
                    <textarea
                      className={`textarea textarea-bordered min-h-[110px] w-full resize-none ${formErrors.observaciones ? "textarea-error" : ""
                        }`}
                      value={formData.observaciones}
                      onChange={(e) => handleFieldChange("observaciones", e.target.value)}
                      placeholder="Escribe las observaciones de la atención..."
                    />
                    {formErrors.observaciones && (
                      <span className="text-sm text-error">{formErrors.observaciones}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-base-content">
                      Diagnóstico o resumen <span className="text-error">*</span>
                    </span>
                    <textarea
                      className={`textarea textarea-bordered min-h-[110px] w-full resize-none ${formErrors.diagnostico ? "textarea-error" : ""
                        }`}
                      value={formData.diagnostico}
                      onChange={(e) => handleFieldChange("diagnostico", e.target.value)}
                      placeholder="Diagnóstico o resumen clínico..."
                    />
                    {formErrors.diagnostico && (
                      <span className="text-sm text-error">{formErrors.diagnostico}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-base-content">Indicaciones</span>
                    <textarea
                      className="textarea textarea-bordered min-h-[110px] w-full resize-none"
                      value={formData.indicaciones}
                      onChange={(e) => handleFieldChange("indicaciones", e.target.value)}
                      placeholder="Indicaciones para el paciente..."
                    />
                  </div>

                  <div className="modal-action mt-2 flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      className="btn btn-ghost w-full sm:w-auto"
                      onClick={cerrarModalFinalizacion}
                      disabled={guardandoRegistro}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary w-full sm:w-auto disabled:btn-disabled"
                      onClick={solicitarConfirmacionFinal}
                      disabled={!puedeFinalizar || guardandoRegistro}
                    >
                      Guardar y finalizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={cerrarModalFinalizacion}></div>
        </div>
      )}

      {mostrarConfirmacionFinal && citaParaFinalizar && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold text-base-content">Confirmar finalización</h3>
            <p className="mt-3 text-sm text-base-content/70">
              ¿Deseas finalizar esta consulta? Luego quedará disponible como detalle de atención.
            </p>

            <div className="mt-5 rounded-2xl bg-base-200 p-4 text-sm">
              <p className="font-semibold text-base-content">
                {nombresPacientes[citaParaFinalizar.pacienteId] || `Paciente #${citaParaFinalizar.pacienteId}`}
              </p>
              <p className="text-base-content/60">
                {formatFecha(citaParaFinalizar.fecha)} · {formatTipo(citaParaFinalizar.tipo)}
              </p>
            </div>

            <div className="modal-action flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="btn btn-ghost w-full sm:w-auto"
                onClick={() => setMostrarConfirmacionFinal(false)}
                disabled={guardandoRegistro}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn btn-primary w-full sm:w-auto min-w-44 gap-2"
                onClick={finalizarConRegistro}
                disabled={guardandoRegistro}
                aria-busy={guardandoRegistro}
              >
                {guardandoRegistro ? (
                  <>
                    <IconoCarga className="h-5 w-5 shrink-0 text-primary-content" />
                    Guardando…
                  </>
                ) : (
                  "Confirmar y finalizar"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !guardandoRegistro && setMostrarConfirmacionFinal(false)}></div>
        </div>
      )}
    </div>
  );
}
