import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer"
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function MiFichaPaciente() {

    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [ficha, setFicha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    function imprimirPagina() {
        window.print();
    }

    useEffect(() => {
        const cargarFicha = async () => {
            if (!usuario?.id) return;

            try {
                setLoading(true);
                const fichaRes = await axios.get(`http://localhost:8081/usuarios/${usuario.id}`);
                setFicha(fichaRes.data);
            } catch (err) {
                console.error("Error al cargar ficha:", err);
                setError("No se pudo cargar la ficha.");
            } finally {
                setLoading(false);
            }
        };

        cargarFicha();
    }, [usuario]);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>{error}</div>;
    if (!ficha) return <div>No se encontró la ficha.</div>;

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
                        Mi Ficha Médica
                    </h1>

                    <p className="text-primary-content/70 text-base sm:text-lg mb-8">
                        Aquí puedes ver tu información médica.
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-base-100 p-6 rounded-box shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold">Información Personal</h3>
                            <p><strong>Nombre:</strong> {ficha.nombre}</p>
                            <p><strong>RUT:</strong> {ficha.rut}</p>
                            <p><strong>Teléfono:</strong> {ficha.telefono}</p>
                            <p><strong>Email:</strong> {ficha.email}</p>
                            <p><strong>Previsión:</strong> {ficha.prevision}</p>
                            <p><strong>Fecha de Nacimiento:</strong> {ficha.fechaNacimiento}</p>
                            <p><strong>Alergias:</strong> {ficha.alergias}</p>
                            <p><strong>Enfermedades Crónicas:</strong> {ficha.enfermedadesCronicas}</p>
                            <p><strong>Tipo de sangre:</strong> {ficha.tipoSangre}</p>

                        </div>

                    </div>
                    <button
                        className="btn btn-sm btn-primary transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 w-24 mt-5"
                        onClick={imprimirPagina}
                    >
                        Imprimir
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}