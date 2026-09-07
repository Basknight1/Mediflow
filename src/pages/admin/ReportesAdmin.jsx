import { useEffect, useState } from "react";
import { api } from "../../config/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const statCards = [
  { key: "pacientes", label: "Total pacientes", emoji: "👥", color: "text-primary" },
  { key: "medicos", label: "Total medicos", emoji: "🩺", color: "text-secondary" },
  { key: "citas", label: "Citas agendadas", emoji: "📋", color: "text-accent" },
  { key: "finalizadas", label: "Citas finalizadas", emoji: "✅", color: "text-success" },
  { key: "pagos", label: "Pagos registrados", emoji: "💳", color: "text-warning" },
];

export default function ReportesAdmin() {
  const [stats, setStats] = useState({
    pacientes: 0,
    medicos: 0,
    citas: 0,
    finalizadas: 0,
    pagos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        setLoading(true);
        setError(null);

        const [pacientesRes, medicosRes, citasRes, pagosRes] = await Promise.all([
          api.get("/admin/pacientes"),
          api.get("/admin/medicos"),
          api.get("/citas"),
          api.get("/pagos"),
        ]);

        const pacientes = Array.isArray(pacientesRes.data) ? pacientesRes.data : [];
        const medicos = Array.isArray(medicosRes.data) ? medicosRes.data : [];
        const citas = Array.isArray(citasRes.data) ? citasRes.data : [];
        const pagos = Array.isArray(pagosRes.data) ? pagosRes.data : [];

        setStats({
          pacientes: pacientes.length,
          medicos: medicos.length,
          citas: citas.length,
          finalizadas: citas.filter((cita) => cita.estado === "FINALIZADA").length,
          pagos: pagos.length,
        });
      } catch (err) {
        console.error("No se pudieron cargar los reportes", err);
        setError("No se pudieron cargar los reportes.");
      } finally {
        setLoading(false);
      }
    };

    cargarReportes();
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      <section className="bg-primary px-6 py-10 sm:px-12 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-warning text-info-content font-semibold">
            Administrador
          </span>
          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Reportes
          </h1>
          <p className="text-primary-content/70 text-base sm:text-lg">
            Estadisticas basicas del sistema.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {statCards.map((card) => (
              <div key={card.key} className="card bg-base-100 shadow-sm">
                <div className="card-body items-center text-center p-5">
                  <span className="text-3xl">{card.emoji}</span>
                  <p className="text-sm font-semibold text-base-content/70">
                    {card.label}
                  </p>
                  <p className={`text-4xl font-bold ${card.color}`}>
                    {stats[card.key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
