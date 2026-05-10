import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import AvatarDefault from "../../assets/avatar-default.png"

export default function MiPerfilPaciente() {
    const { usuario, logout } = useAuth();

    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editando, setEditando] = useState(false);
    const [perfilTemp, setPerfilTemp] = useState(null);

    useEffect(() => {
        const cargarPerfil = async () => {
            if (!usuario?.id) return;
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:8081/usuarios/${usuario.id}`);
                const datos = { ...HARDCODEADOS, ...res.data };
                setPerfil(datos);
                setPerfilTemp(datos);
            } catch (err) {
                console.error("Error al cargar perfil:", err);
                setError("No se pudo cargar el perfil.");
            } finally {
                setLoading(false);
            }
        };
        cargarPerfil();
    }, [usuario]);

    const handleChange = (e) => {
        setPerfilTemp({ ...perfilTemp, [e.target.name]: e.target.value });
    };

    const handleGuardar = () => {
        setPerfil(perfilTemp);
        setEditando(false);
    };

    const handleCancelar = () => {
        setPerfilTemp(perfil);
        setEditando(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg" /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-error">{error}</div>;
    if (!perfil) return null;

    const val = (key) => (editando ? perfilTemp[key] : perfil[key]);
    const esCampoEditable = (name) =>
        editando && ["direccion", "contactoEmergencia", "telefonoEmergencia"].includes(name);

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            {/* HERO */}
            <section className="bg-primary px-6 py-10">
                <div className="max-w-4xl mx-auto">
                    <span className="badge badge-success text-success-content font-semibold">
                        Paciente
                    </span>
                    <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
                        Mi Perfil
                    </h1>
                    <p className="text-primary-content/70 text-base sm:text-lg">
                        Revisa y actualiza tus datos personales, {usuario?.nombre?.split(" ")[0]}.
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Cabecera con foto */}
                <div className="bg-base-100 rounded-box shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="avatar">
                                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img src={AvatarDefault} alt="Avatar usuario" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold">{perfil.nombre}</h2>
                            <p className="text-base-content/60">{perfil.email}</p>
                            <p className="text-base-content/60">RUT: {perfil.rut}</p>
                        </div>

                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            {!editando ? (
                                <button className="btn btn-primary" onClick={() => setEditando(true)}>
                                    Editar perfil
                                </button>
                            ) : (
                                <>
                                    <button className="btn btn-success" onClick={handleGuardar}>Guardar cambios</button>
                                    <button className="btn btn-ghost" onClick={handleCancelar}>Cancelar</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Datos Personales */}
                <div className="bg-base-100 rounded-box shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Datos Personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Campo label="Nombre completo" name="nombre" value={val("nombre")} editando={esCampoEditable("nombre")} onChange={handleChange} />
                        <Campo label="RUT" name="rut" value={val("rut")} editando={esCampoEditable("rut")} onChange={handleChange} />
                        <Campo
                            label="Fecha de Nacimiento"
                            name="fechaNacimiento"
                            value={val("fechaNacimiento")?.split('-').reverse().join('/') || "—"}
                            editando={esCampoEditable("fechaNacimiento")}
                            onChange={handleChange}
                        />
                        <Campo label="Género" name="genero" value={val("genero")} editando={esCampoEditable("genero")} onChange={handleChange} />
                        <Campo label="Teléfono" name="telefono" value={val("telefono")} editando={esCampoEditable("telefono")} onChange={handleChange} />
                        <Campo label="Email" name="email" value={val("email")} editando={esCampoEditable("email")} onChange={handleChange} />
                        <Campo label="Dirección" name="direccion" value={val("direccion")} editando={esCampoEditable("direccion")} onChange={handleChange} />
                    </div>
                </div>

                {/* Información Médica */}
                <div className="bg-base-100 rounded-box shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Información Médica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Campo label="Previsión" name="prevision" value={val("prevision")} editando={esCampoEditable("prevision")} onChange={handleChange} />
                        <Campo label="Tipo de Sangre" name="tipoSangre" value={val("tipoSangre")} editando={esCampoEditable("tipoSangre")} onChange={handleChange} />
                        <Campo label="Alergias" name="alergias" value={val("alergias") || "Ninguna alergia"} editando={esCampoEditable("alergias")} onChange={handleChange} />
                        <Campo label="Enfermedades Crónicas" name="enfermedadesCronicas" value={val("enfermedadesCronicas") || "Ninguna enfermedad crónica"} editando={esCampoEditable("enfermedadesCronicas")} onChange={handleChange} />
                    </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="bg-base-100 rounded-box shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Contacto de Emergencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Campo label="Nombre" name="contactoEmergencia" value={val("contactoEmergencia")} editando={esCampoEditable("contactoEmergencia")} onChange={handleChange} />
                        <Campo label="Teléfono" name="telefonoEmergencia" value={val("telefonoEmergencia")} editando={esCampoEditable("telefonoEmergencia")} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="btn btn-outline btn-error" onClick={logout}>
                        Cerrar sesión
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function Campo({ label, name, value, editando, onChange }) {
    return (
        <div>
            <label className="text-xs text-base-content/60 uppercase font-semibold tracking-wide">
                {label}
            </label>
            {editando ? (
                <input
                    type="text"
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    className="input input-bordered w-full mt-1"
                />
            ) : (
                <p className="font-semibold text-base-content mt-1">{value ?? "—"}</p>
            )}
        </div>
    );
}
