import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ConsultaDetalleModal from "../../components/ConsultaDetalleModal";
import { useAuth } from "../../context/AuthContext";

const accesosRapidos = [
  { label: "Mis Citas", emoji: "📋", ruta: "/paciente/mis-citas" },
  { label: "Agendar", emoji: "➕", ruta: "/paciente/agendar" },
  { label: "Mi Ficha", emoji: "📄", ruta: "/paciente/ficha" },
];

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

export default function HomePaciente() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarCitas = async () => {
      if (!usuario?.id) return;

      try {
        setLoading(true);
        const citasRes = await axios.get(`http://localhost:8082/citas/paciente/${usuario.id}`);
        const citasBase = Array.isArray(citasRes.data) ? citasRes.data : [];

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
              console.error("Error al enriquecer cita del paciente:", err);
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
      } catch (err) {
        console.error("Error al cargar citas:", err);
        setError("No se pudieron cargar las citas.");
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, [usuario?.id]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const citasProximas = citas
    .filter((cita) => {
      const fechaCita = new Date(`${cita.fecha}T00:00:00`);
      return fechaCita >= hoy && cita.estado !== "CANCELADA" && cita.estado !== "FINALIZADA";
    })
    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`))
    .slice(0, 3);

  const ultimasAtenciones = citas
    .filter((cita) => cita.estado === "FINALIZADA" && cita.registroConsulta)
    .slice(0, 3);

  const citasConfirmadas = citasProximas.filter((cita) => cita.estado === "CONFIRMADA").length;
  const citasPendientes = citasProximas.filter((cita) => cita.estado === "PENDIENTE").length;

  const mensajeHero = () => {
    if (loading) return "Cargando tus citas...";
    if (error) return "No se pudieron cargar tus citas.";
    const partes = [];
    if (citasConfirmadas > 0) {
      partes.push(`${citasConfirmadas} confirmada${citasConfirmadas > 1 ? "s" : ""}`);
    }
    if (citasPendientes > 0) {
      partes.push(`${citasPendientes} pendiente${citasPendientes > 1 ? "s" : ""}`);
    }
    if (partes.length === 0) return "No tienes citas proximas.";
    return `Tienes ${partes.join(" y ")} proximamente.`;
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <section className="bg-primary px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-success font-semibold text-white">Paciente</span>

          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Hola, {usuario?.nombre}
          </h1>

          <p className="text-primary-content/70 text-base sm:text-lg mb-8">{mensajeHero()}</p>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
              onClick={() => navigate("/paciente/agendar")}
            >
              Agendar cita
            </button>
            <button
              className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
              onClick={() => navigate("/paciente/mis-citas")}
            >
              Ver mis citas
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {accesosRapidos.map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.ruta)}
              className="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="card-body items-center text-center p-4">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-semibold text-base-content">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                Proximas Citas
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
                ) : citasProximas.length === 0 ? (
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body items-center text-center py-8">
                      <span className="text-4xl mb-2">📭</span>
                      <p className="text-base-content/60">No tienes citas proximas.</p>
                      <button className="btn btn-primary btn-sm mt-2" onClick={() => navigate("/paciente/agendar")}>
                        Agendar una cita
                      </button>
                    </div>
                  </div>
                ) : (
                  citasProximas.map((cita) => (
                    <div
                      key={cita.id}
                      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                        <div className="bg-base-200 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                          <span className="text-xl">🩺</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base-content truncate">{cita.doctorNombre}</p>
                          <p className="text-sm text-base-content/60">{cita.especialidad}</p>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs text-base-content/60">
                            {formatearFecha(cita.fecha)} · {formatearHora(cita.hora)}
                          </span>
                          <span className={`badge badge-sm ${estadoBadge[cita.estado]}`}>
                            {estadoLabel[cita.estado]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-base-content">Ultimas atenciones</h2>
                {ultimasAtenciones.length > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate("/paciente/mis-citas")}>
                    Ver historial
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                  </div>
                ) : ultimasAtenciones.length === 0 ? (
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body py-6">
                      <p className="text-base-content/60">Aun no tienes atenciones finalizadas con detalle disponible.</p>
                    </div>
                  </div>
                ) : (
                  ultimasAtenciones.map((cita) => (
                    <div key={cita.id} className="card bg-base-100 shadow-sm">
                      <div className="card-body p-4 sm:p-5 flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base-content truncate">{cita.doctorNombre}</p>
                            <p className="text-sm text-base-content/60">{cita.especialidad}</p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-xs text-base-content/60">
                              {formatearFecha(cita.fecha)} · {formatearHora(cita.hora)}
                            </p>
                            <span className="badge badge-sm badge-primary mt-1">Finalizada</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-base-content/70 line-clamp-1">
                            {cita.registroConsulta?.diagnostico || "Detalle disponible"}
                          </p>
                          <button
                            className="btn btn-outline btn-primary btn-xs"
                            onClick={() => setDetalleSeleccionado(cita)}
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-base-content flex items-center gap-2">Mi Salud</h2>

            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-5 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg mt-0.5">🏥</span>
                  <div>
                    <p className="text-xs text-base-content/50 uppercase font-medium tracking-wide">
                      Prevision
                    </p>
                    <p className="font-bold text-base-content">{usuario?.prevision}</p>
                  </div>
                </div>

                <div className="divider my-0"></div>

                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg mt-0.5">🪪</span>
                  <div>
                    <p className="text-xs text-base-content/50 uppercase font-medium tracking-wide">RUT</p>
                    <p className="font-bold text-base-content">{usuario?.rut || "No disponible"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4 gap-1">
                <div className="flex items-start gap-2">
                  <span className="text-secondary text-lg shrink-0">💡</span>
                  <div>
                    <p className="font-bold text-sm text-base-content">Recordatorio</p>
                    <p className="text-sm text-base-content/60 leading-relaxed">
                      Recuerda confirmar tu asistencia 24 hrs antes de cada cita.
                    </p>
                  </div>
                </div>
              </div>
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

      <Footer />
    </div>
  );
}
