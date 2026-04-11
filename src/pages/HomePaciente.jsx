import Navbar from "../components/Navbar";
import Footer from "../components/Footer"
/* Datos de ejemplo */
const proximasCitas = [
  {
    id: 1,
    doctor: "Dra. Ana López",
    especialidad: "Dermatología",
    fecha: "Lun 08 Abr",
    hora: "10:30",
    estado: "Confirmada",
  },
  {
    id: 2,
    doctor: "Dr. Carlos Ruiz",
    especialidad: "Cardiología",
    fecha: "Mié 10 Abr",
    hora: "11:00",
    estado: "Pendiente",
  },
  {
    id: 3,
    doctor: "Dra. María Paz Soler",
    especialidad: "Psicología",
    fecha: "Vie 12 Abr",
    hora: "15:00",
    estado: "Confirmada",
  },
];

const accesosRapidos = [
  { label: "Mis Citas", emoji: "📋" },
  { label: "Agendar", emoji: "➕" },
  { label: "Mi Ficha", emoji: "📄" },
  { label: "Perfil", emoji: "👤" },
];

/* ─── Mapeo estado → clases DaisyUI ─── */
const estadoBadge = {
  Confirmada: "badge-success",
  Pendiente: "badge-warning",
  Cancelada: "badge-error",
};

export default function HomePaciente() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar rol="paciente" />

      {/* HERO */}
      <section className="bg-primary px-6 py-12 sm:px-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-success text-success-content font-semibold">
            Paciente
          </span>

          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Hola, Benjamín
          </h1>

          <p className="text-primary-content/70 text-base sm:text-lg mb-8">
            Tienes 1 cita confirmada para esta semana.
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
              Agendar cita
            </button>
            <button className="btn btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary">
              Ver mis citas
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

        {/* ── Grid: Citas + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── COLUMNA IZQUIERDA: Próximas Citas (2/3) ── */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              📅 Próximas Citas
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
                      <span className="text-xl">🩺</span>
                    </div>

                    {/* Info del doctor */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base-content truncate">
                        {cita.doctor}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {cita.especialidad}
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

            {/* Banner informativo */}
            <div className="alert bg-neutral text-neutral-content mt-6">
              <span className="text-lg">📢</span>
              <div>
                <span className="font-semibold">Nueva sucursal: Providencia</span>
                <span className="text-neutral-content/70"> — Ahora atendiendo especialidades. Reserva tu hora hoy.</span>
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA: Mi Salud (1/3) ── */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
              ❤️ Mi Salud
            </h2>

            {/* Card de información */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-5 gap-4">
                {/* Previsión */}
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg mt-0.5">🏥</span>
                  <div>
                    <p className="text-xs text-base-content/50 uppercase font-medium tracking-wide">
                      Previsión
                    </p>
                    <p className="font-bold text-base-content">Isapre Colmena</p>
                    <p className="text-sm text-base-content/60">Plan Preferente 2024</p>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* RUT */}
                <div className="flex items-start gap-3">
                  <span className="text-primary text-lg mt-0.5">🪪</span>
                  <div>
                    <p className="text-xs text-base-content/50 uppercase font-medium tracking-wide">
                      RUT
                    </p>
                    <p className="font-bold text-base-content">18.452.123-K</p>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* Último Examen */}
                <div>
                  <p className="text-xs text-base-content/50 uppercase font-medium tracking-wide mb-2">
                    Último Examen
                  </p>
                  <div
                    className="bg-base-200 rounded-xl p-3 flex items-center gap-3
                               cursor-pointer hover:bg-base-300 transition-colors duration-200"
                  >
                    <span className="text-lg">🔬</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-base-content">Perfil Bioquímico</p>
                      <p className="text-xs text-base-content/50">04 de Abril, 2024</p>
                    </div>
                    <span className="text-base-content/30">›</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card recordatorio */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}