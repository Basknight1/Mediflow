import { useState } from "react";

import Navbar from "../../components/Navbar";

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
  {
    id: 4,
    doctor: "Dr. José Contreras",
    especialidad: "Traumatología",
    fecha: "Lun 15 Abr",
    hora: "09:00",
    estado: "Pendiente",
  },
  {
    id: 5,
    doctor: "Dra. Valentina Torres",
    especialidad: "Medicina General",
    fecha: "Mié 03 Mar",
    hora: "08:30",
    estado: "Confirmada",
  },
  {
    id: 6,
    doctor: "Dr. Rodrigo Valdés",
    especialidad: "Neurología",
    fecha: "Vie 21 Feb",
    hora: "16:00",
    estado: "Cancelada",
  },
];

/* ─── Mapeo estado → clases DaisyUI ─── */
const estadoBadge = {
  Confirmada: "badge-success",
  Pendiente: "badge-warning",
  Cancelada: "badge-error",
};

export default function CitasPaciente() {
  const [filtroActivo, setFiltroActivo] = useState("Todas")

  const citasFiltradas = filtroActivo === "Todas"
    ? proximasCitas
    : proximasCitas.filter(cita => cita.estado === filtroActivo)
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
            Revisa tus próximas citas médicas.
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
                checked={filtroActivo === "Confirmada"}
                onChange={() => setFiltroActivo("Confirmada")}
              />
              <input
                className="btn btn-primary"
                type="radio"
                name="filtro"
                aria-label="Pendiente"
                checked={filtroActivo === "Pendiente"}
                onChange={() => setFiltroActivo("Pendiente")}
              />
              <input
                className="btn btn-primary"
                type="radio"
                name="filtro"
                aria-label="Cancelada"
                checked={filtroActivo === "Cancelada"}
                onChange={() => setFiltroActivo("Cancelada")}
              />
            </div>
          </div>


          {/* ── COLUMNA IZQUIERDA: Próximas Citas (2/3) ── */}
          <div className="">
            <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
              📅 Historial de Citas
            </h2>

            <div className="flex flex-col gap-3">
              {citasFiltradas.map((cita) => (
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
          </div>
        </div>
      </main>
    </div>
  );
}