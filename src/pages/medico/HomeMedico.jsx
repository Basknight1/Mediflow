import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

const accesosRapidos = [
  { label: "Mi agenda", ruta: "/medico/mi-agenda" },
  { label: "Mis pacientes", ruta: "/medico/pacientes" },
  { label: "Perfil", ruta: "/medico/perfil" },
];

const estadoBadge = {
  CONFIRMADA: "badge-success",
  PENDIENTE: "badge-warning",
  CANCELADA: "badge-error",
};

const estadoLabel = {
  CONFIRMADA: "Confirmada",
  PENDIENTE: "Pendiente",
  CANCELADA: "Cancelada",
};

export default function HomeMedico() {
  const { usuario, medico } = useAuth();
  const [citasHoy, setCitasHoy] = useState([]);
  const [nombresPacientes, setNombresPacientes] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!usuario?.id) return;
    setCargando(true);
    const hoy = new Date().toISOString().split("T")[0];

    const cargar = async () => {
      try {
        const res = await axios.get(`http://localhost:8082/citas/medico/${usuario.id}`);
        const deHoy = res.data.filter((c) => c.fecha === hoy);
        setCitasHoy(deHoy);

        const ids = [...new Set(deHoy.map((c) => c.pacienteId))];
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
        // silently fail on home
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [usuario?.id]);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-info text-info-content font-semibold">Médico</span>
          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Hola, {usuario?.nombre || "Doctor"}
          </h1>
          <p className="text-primary-content/70 text-base sm:text-lg mb-8">
            {medico?.especialidad ? `${medico.especialidad} · ` : ""}Bienvenido al panel médico.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{citasHoy.length}</span>
              <span className="text-sm ml-2 opacity-70">citas hoy</span>
            </div>
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{citasHoy.filter(c => c.estado === "CONFIRMADA").length}</span>
              <span className="text-sm ml-2 opacity-70">confirmadas</span>
            </div>
            <div className="bg-primary-content/10 backdrop-blur rounded-lg px-4 py-2 text-primary-content">
              <span className="text-2xl font-bold">{citasHoy.filter(c => c.estado === "PENDIENTE").length}</span>
              <span className="text-sm ml-2 opacity-70">pendientes</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/medico/mi-agenda" className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
              Ver agenda completa
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {accesosRapidos.map((item) => (
            <Link key={item.label} to={item.ruta}>
              <div className="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                <div className="card-body items-center text-center p-4">
                  <span className="text-sm font-semibold text-base-content">{item.label}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Citas de hoy */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
            Citas de hoy
            <span className="badge badge-ghost badge-sm">{citasHoy.length}</span>
          </h2>

          {cargando && (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          )}

          {!cargando && citasHoy.length === 0 && (
            <div className="text-center py-8 text-base-content/50">
              <p className="font-semibold">No tienes citas programadas para hoy</p>
              <Link to="/medico/mi-agenda" className="btn btn-primary btn-sm mt-3">Ver agenda completa</Link>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {citasHoy.map((cita) => {
              const nombre = nombresPacientes[cita.pacienteId] || `Paciente #${cita.pacienteId}`;
              return (
                <div key={cita.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                    <div className="bg-primary/10 text-primary rounded-xl w-12 h-12 flex items-center justify-center shrink-0 font-bold text-sm">
                      {nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base-content truncate">{nombre}</p>
                      <p className="text-sm text-base-content/60">{cita.motivo || "Sin motivo"}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs text-base-content/60">
                        {cita.hora?.slice(0, 5)} · {cita.duracionMinutos || "—"} min
                      </span>
                      <span className={`badge badge-sm ${estadoBadge[cita.estado]}`}>
                        {estadoLabel[cita.estado]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
