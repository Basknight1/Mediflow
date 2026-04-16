import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer"
/* Datos de ejemplo */
const proximasCitas = [
  {
    id: 1,
    paciente: "Andrés Montenegro",
    tipoconsulta: "Medicina General",
    fecha: "Mar 12 May",
    hora: "15:00",
    estado: "Pendiente",
  },
  {
    id: 2,
    paciente: "Carlos Contreras",
    tipoconsulta: "Control de presión",
    fecha: "Mie 31 Jun",
    hora: "19:00",
    estado: "Confirmada",
  },
  {
    id: 3,
    paciente: "Josefa Rojas",
    tipoconsulta: "Cardiología",
    fecha: "Vie 02 Sep",
    hora: "09:15",
    estado: "Cancelada",
  },
  {
    id: 4,
    paciente: "Pablo Carvajal",
    tipoconsulta: "Primera Consulta",
    fecha: "Jue 06 Jul",
    hora: "11:30",
    estado: "Confirmada",
  },
];

const accesosRapidos = [
  { label: "Mi agenda", emoji: "📋" },
  { label: "Mis pacientes", emoji: "👥" },
  { label: "Historial", emoji: "📄" },
  { label: "Perfil", emoji: "👤" },
];

/* ─── Mapeo estado → clases DaisyUI ─── */
const estadoBadge = {
  Confirmada: "badge-success",
  Pendiente: "badge-warning",
  Cancelada: "badge-error",
};

export default function HomeMedico() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-info text-info-content font-semibold">
            Médico
          </span>

          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Hola, Dr. Benjamín
          </h1>

          <p className="text-primary-content/70 text-base sm:text-lg mb-8">
            Tienes 4 citas programadas para hoy.
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
              Ver agenda de hoy
            </button>
            <button className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
              Ver historial
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
                         transition-all duration-200"
            >
              <div className="card-body items-center text-center p-4">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-semibold text-base-content">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Citas ── */}
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* ── Próximas Citas ── */}
          <div>
            <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              📅 Citas de hoy
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
                      <span className="text-xl">👤</span>
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
        </div>
      </main >

      {/* Footer */}
      < Footer />
    </div >
  );
}