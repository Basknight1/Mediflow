import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

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

/* ─── Iniciales del nombre para avatar ─── */
function getIniciales(nombre) {
  return (nombre || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ─── Formatear fecha legible ─── */
function formatFechaLabel(fechaStr) {
  const fecha = new Date(fechaStr + "T00:00:00");
  return fecha.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
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

export default function AgendaMedico() {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState([]);
  const [nombresPacientes, setNombresPacientes] = useState({});
  const [filtroActivo, setFiltroActivo] = useState("Todas");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Cargar citas del médico
  useEffect(() => {
    if (!usuario?.id) return;
    setCargando(true);
    const cargarCitas = async () => {
      try {
        const res = await axios.get(`http://localhost:8082/citas/medico/${usuario.id}`);
        setCitas(res.data);

        // Cargar nombres de pacientes
        const ids = [...new Set(res.data.map((c) => c.pacienteId))];
        const nombres = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await axios.get(`http://localhost:8081/usuarios/${id}`);
              nombres[id] = r.data.nombre;
            } catch {
              nombres[id] = `Paciente #${id}`;
            }
          })
        );
        setNombresPacientes(nombres);
      } catch {
        setError("No se pudieron cargar las citas.");
      } finally {
        setCargando(false);
      }
    };
    cargarCitas();
  }, [usuario?.id]);

  // Cambiar estado de una cita
  const cambiarEstado = async (citaId, nuevoEstado) => {
    try {
      const res = await axios.put(
        `http://localhost:8082/citas/${citaId}/estado?nuevoEstado=${nuevoEstado}`
      );
      setCitas((prev) => prev.map((c) => (c.id === citaId ? res.data : c)));
    } catch {
      alert("No se pudo actualizar el estado.");
    }
  };

  // Filtrar y agrupar
  const citasFiltradas =
    filtroActivo === "Todas" ? citas : citas.filter((c) => c.estado === filtroActivo);
  const citasAgrupadas = agruparPorFecha(citasFiltradas);
  const fechasOrdenadas = Object.keys(citasAgrupadas).sort();

  // Stats del día
  const hoy = new Date().toISOString().split("T")[0];
  const citasHoy = citas.filter((c) => c.fecha === hoy);
  const confirmadas = citasHoy.filter((c) => c.estado === "CONFIRMADA").length;
  const pendientes = citasHoy.filter((c) => c.estado === "PENDIENTE").length;
  const canceladas = citasHoy.filter((c) => c.estado === "CANCELADA").length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <span className="badge badge-info text-info-content font-semibold">Médico</span>
          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Mi Agenda
          </h1>
          <p className="text-primary-content/70 text-base sm:text-lg mb-6">
            Gestiona tus citas y revisa tu agenda diaria.
          </p>

          {/* Stats del día */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{citasHoy.length}</span>
              <span className="text-sm ml-2 opacity-70">citas hoy</span>
            </div>
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{confirmadas}</span>
              <span className="text-sm ml-2 opacity-70">confirmadas</span>
            </div>
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{pendientes}</span>
              <span className="text-sm ml-2 opacity-70">pendientes</span>
            </div>
            {canceladas > 0 && (
              <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
                <span className="text-2xl font-bold">{canceladas}</span>
                <span className="text-sm ml-2 opacity-70">canceladas</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">

          {/* Filtros */}
          <div className="flex flex-col gap-2 mb-2">
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
              <input className="btn btn-primary" type="radio" name="filtro" aria-label="Confirmada"
                checked={filtroActivo === "CONFIRMADA"} onChange={() => setFiltroActivo("CONFIRMADA")} />
              <input className="btn btn-primary" type="radio" name="filtro" aria-label="Pendiente"
                checked={filtroActivo === "PENDIENTE"} onChange={() => setFiltroActivo("PENDIENTE")} />
              <input className="btn btn-primary" type="radio" name="filtro" aria-label="Cancelada"
                checked={filtroActivo === "CANCELADA"} onChange={() => setFiltroActivo("CANCELADA")} />
            </div>
          </div>

          {/* Cargando */}
          {cargando && (
            <div className="text-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/50 mt-3">Cargando citas...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Citas agrupadas por día */}
          {!cargando && !error && fechasOrdenadas.map((fecha) => {
            const grupo = citasAgrupadas[fecha];
            const esHoy = fecha === hoy;

            return (
              <div key={fecha}>
                <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                  {esHoy ? "📅 Citas de hoy" : `🗓️ ${formatFechaLabel(fecha)}`}
                  <span className="badge badge-ghost badge-sm">
                    {grupo.length} {grupo.length === 1 ? "cita" : "citas"}
                  </span>
                </h2>

                <div className="flex flex-col gap-3">
                  {grupo.map((cita) => {
                    const nombrePaciente = nombresPacientes[cita.pacienteId] || `Paciente #${cita.pacienteId}`;
                    return (
                      <div key={cita.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="card-body p-4 sm:p-5">
                          <div className="flex-row flex items-center gap-4">
                            {/* Avatar */}
                            <div className="bg-primary/10 text-primary rounded-xl w-12 h-12 flex items-center justify-center shrink-0 font-bold text-sm">
                              {getIniciales(nombrePaciente)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-base-content truncate">{nombrePaciente}</p>
                              <p className="text-sm text-base-content/60">{cita.motivo || "Sin motivo"}</p>
                            </div>

                            {/* Hora + badge */}
                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <span className="text-xs text-base-content/60">
                                {cita.hora?.slice(0, 5)} · {cita.duracionMinutos || "—"} min
                              </span>
                              <span className={`badge badge-sm ${estadoBadge[cita.estado]}`}>
                                {estadoLabel[cita.estado]}
                              </span>
                            </div>
                          </div>

                          {/* Acciones (solo si está PENDIENTE) */}
                          {cita.estado === "PENDIENTE" && (
                            <div className="flex gap-2 mt-3 justify-end">
                              <button
                                className="btn btn-success btn-xs"
                                onClick={() => cambiarEstado(cita.id, "CONFIRMADA")}
                              >
                                Confirmar
                              </button>
                              <button
                                className="btn btn-error btn-xs"
                                onClick={() => cambiarEstado(cita.id, "CANCELADA")}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                          {/* Acción confirmada */}
                          {cita.estado === "CONFIRMADA" && (
                            <div className="flex gap-2 mt-3 justify-end">
                              <button className="btn btn-neutral btn-xs" onClick={() => cambiarEstado(cita.id, "FINALIZADA")}>
                                ✓ Finalizar cita
                              </button>
                              <button className="btn btn-error btn-xs" onClick={() => cambiarEstado(cita.id, "CANCELADA")}>
                                Cancelar
                              </button>
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

          {/* Sin resultados */}
          {!cargando && !error && fechasOrdenadas.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              <span className="text-4xl mb-3 block">📭</span>
              <p className="font-semibold">
                {filtroActivo === "Todas" ? "No tienes citas registradas" : "No hay citas con ese estado"}
              </p>
              <p className="text-sm">
                {filtroActivo !== "Todas" && "Prueba con otro filtro."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
