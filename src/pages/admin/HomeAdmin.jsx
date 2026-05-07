import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

/* Datos de ejemplo de Próximas citas */
const proximasCitas = [
  {
    id: 1,
    paciente: "Andrés Montenegro → Dra. Ana López",
    tipoconsulta: "Medicina General",
    fecha: "Mar 12 May de 2026",
    hora: "15:00",
    estado: "Pendiente",
  },
  {
    id: 2,
    paciente: "Carlos Contreras → Dr. Carlos Ruiz",
    tipoconsulta: "Control de presión",
    fecha: "Mie 31 Jun de 2026",
    hora: "19:00",
    estado: "Confirmada",
  },
  {
    id: 3,
    paciente: "Josefa Rojas → Dra. María Paz Soler",
    tipoconsulta: "Cardiología",
    fecha: "Vie 02 Sep de 2026",
    hora: "09:15",
    estado: "Cancelada",
  },
  {
    id: 4,
    paciente: "Pablo Carvajal → Dr. José Contreras",
    tipoconsulta: "Primera Consulta",
    fecha: "Jue 06 Jul de 2026",
    hora: "11:30",
    estado: "Confirmada",
  },
];

/* Datos de ejemplo de Pagos pendientes */
const pagosPacientes = [
  {
    id: 1,
    paciente: "Andrés Montenegro",
    monto: "$45.000",
    estado: "Pagado",
    fecha: "Mar 12 May de 2026",
  },
  {
    id: 2,
    paciente: "Antonia Rojas",
    monto: "$89.000",
    estado: "Pendiente",
    fecha: "Mie 28 Ene de 2026",
  },
];

/* Accesos rápidos */
const accesosRapidos = [
  { label: "Citas hoy", cantidad: "18", emoji: "📋" },
  { label: "Pacientes activos", cantidad: "142", emoji: "👥" },
  { label: "Pagos pendientes", cantidad: "5", emoji: "📄" },
  { label: "Médicos activos", cantidad: "7", emoji: "👤" },
];

const estadoBadge = {
  Confirmada: "badge-success",
  Pendiente: "badge-warning",
  Cancelada: "badge-error",
  Finalizada: "badge-primary"
};

const pagoBadge = {
  Pagado: "badge-success",
  Pendiente: "badge-warning",
};

export default function HomeAdmin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-warning text-info-content font-semibold">
            Administrador
          </span>

          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Panel de Control
          </h1>

          <p className="text-primary-content/70 text-base sm:text-lg mb-8">
            Resumen operacional del día de hoy.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
              onClick={() => navigate("/admin/pacientes")}
            >
              Gestionar pacientes
            </button>
            <button
              className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
              onClick={() => navigate("/admin/reportes")}
            >
              Ver reportes
            </button>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ── Accesos Rápidos ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {accesosRapidos.map((item) => (
            <div
              key={item.label}
              className="card bg-base-100 shadow-sm cursor-pointer
                         hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-200 min-h-[150px]"
            >
              <div className="card-body items-center text-center p-4">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-semibold text-base-content">
                  {item.label}
                </span>
                <span className="text-2xl font-bold text-base-content mt-2">
                  {item.cantidad}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Citas + Pagos ── */}
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* ── Próximas Citas ── */}
          <div>
            <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              📅 Últimas citas registradas
            </h2>

            <div className="flex flex-col gap-3">
              {proximasCitas.map((cita) => (
                <div
                  key={cita.id}
                  className="card bg-base-100 shadow-sm
                             hover:shadow-md
                             transition-shadow duration-200"
                >
                  <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                    {/* Icono */}
                    <div className="bg-base-200 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl">🧑🏻‍⚕️</span>
                    </div>

                    {/* Info del paciente */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base-content truncate">
                        {cita.paciente}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {cita.tipoconsulta}
                      </p>
                    </div>

                    {/* Fecha + Badge */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs text-base-content/60">
                        {cita.fecha} · {cita.hora}
                      </span>
                      <span className={`badge badge-sm ${estadoBadge[cita.estado]}`}>
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos pagos */}
          <div>
            <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              🧾 Pagos Recientes
            </h2>

            <div className="flex flex-col gap-3">
              {pagosPacientes.map((pago) => (
                <div
                  key={pago.id}
                  className="card bg-base-100 shadow-sm
                             hover:shadow-md
                             transition-shadow duration-200"
                >
                  <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                    {/* Icono */}
                    <div className="bg-base-200 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl">💰</span>
                    </div>

                    {/* Info del paciente */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base-content truncate">
                        {pago.paciente}
                      </p>
                      <p className="text-sm font-semibold text-base-content">
                        {pago.monto}
                      </p>
                    </div>

                    {/* Fecha + Badge */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs text-base-content/60">
                        {pago.fecha}
                      </span>
                      <span className={`badge badge-sm ${pagoBadge[pago.estado]}`}>
                        {pago.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}
