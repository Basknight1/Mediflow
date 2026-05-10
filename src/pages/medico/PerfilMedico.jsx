import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef } from "react";
import axios from "axios";
import AvatarDefault from "../../assets/avatar-default.png"

// Perfil del médico - usa entidades separadas Usuario y Medico
export default function PerfilMedico() {
  const { usuario, medico, updateUsuario, updateMedico } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(usuario || {});
  const [medicoFormData, setMedicoFormData] = useState(medico || {});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const passwordRef = useRef(null);
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({ passwordActual: "", passwordNueva: "", confirmar: "" });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordExito, setPasswordExito] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const handleCambiarPassword = async () => {
    setPasswordError(null);
    setPasswordExito(false);
    if (passwordData.passwordNueva !== passwordData.confirmar) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passwordData.passwordNueva.length < 6) {
      setPasswordError("La contraseña nueva debe tener al menos 6 caracteres.");
      return;
    }
    setGuardandoPassword(true);
    try {
      await axios.put(`http://localhost:8081/usuarios/${usuario.id}/password`, {
        passwordActual: passwordData.passwordActual,
        passwordNueva: passwordData.passwordNueva,
      });
      setPasswordExito(true);
      setPasswordData({ passwordActual: "", passwordNueva: "", confirmar: "" });
      setTimeout(() => { setPasswordMode(false); setPasswordExito(false); }, 2000);
    } catch {
      setPasswordError("La contraseña actual es incorrecta.");
    } finally {
      setGuardandoPassword(false);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const response = await axios.put(`http://localhost:8081/usuarios/${usuario.id}`, {
        nombre: formData.nombre,
        telefono: formData.telefono,
        biografia: medicoFormData.biografia,
      });
      const actualizado = response.data;
      updateUsuario({ ...usuario, nombre: actualizado.nombre, telefono: actualizado.telefono });
      updateMedico({ ...medico, biografia: actualizado.biografia });
      setEditMode(false);
    } catch (e) {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* HERO */}
      <section className="bg-primary px-6 py-10 sm:px-12 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <span className="badge badge-info text-info-content font-semibold">
            Médico
          </span>

          <h1 className="text-primary-content text-3xl sm:text-5xl font-bold mt-3 mb-2">
            Mi Perfil
          </h1>

          <p className="text-primary-content/70 text-base sm:text-lg">
            Revisa y administra tu información de usuario.
          </p>
        </div>
      </section>

      {/* CONTENIDO */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card lateral */}
          <div className="card bg-base-100 shadow-sm h-fit">
            <div className="card-body items-center text-center py-5 px-4">
              <div className="avatar placeholder">
                <div className="bg-primary/10 text-primary rounded-full w-25">
                  <img src={AvatarDefault} alt="Avatar usuario" />
                </div>
              </div>

              <h2 className="font-bold text-base-content mt-2 text-base">
                {usuario?.nombre || "Usuario"}
              </h2>

              <div className="flex items-center gap-2">
                <p className="text-base-content/60 text-sm">{usuario?.rol || "MÉDICO"}</p>
                <div className="badge badge-success badge-sm">Activo</div>
              </div>

              <div className="divider my-1" />

              <div className="w-full text-left space-y-1 text-xs text-base-content/70">
                <p><span className="font-semibold text-base-content">Correo:</span> {usuario?.email || "N/A"}</p>
                <p><span className="font-semibold text-base-content">Teléfono:</span> {usuario?.telefono || "N/A"}</p>
                <p><span className="font-semibold text-base-content">ID:</span> {usuario?.id || "N/A"}</p>
              </div>

              <button
                className="btn btn-primary btn-sm w-full mt-3"
                onClick={() => { setEditMode(!editMode); setPasswordMode(false); }}
              >
                {editMode ? "Cancelar edición" : "Editar perfil"}
              </button>
              <button
                className="btn btn-outline btn-sm w-full mt-2"
                onClick={() => {
                  setEditMode(false);
                  setPasswordMode(!passwordMode);
                  if (!passwordMode) setTimeout(() => passwordRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                }}
              >
                {passwordMode ? "Cancelar" : "Cambiar contraseña"}
              </button>
            </div>
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Información personal */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-base-content">
                  Información de Usuario
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-base-content/60">Nombre completo</p>
                    <p className="font-semibold text-base-content">
                      {usuario?.nombre || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-base-content/60">Rol</p>
                    <p className="font-semibold text-base-content">{usuario?.rol || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-base-content/60">Correo electrónico</p>
                    <p className="font-semibold text-base-content">{usuario?.email || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-base-content/60">Teléfono</p>
                    <p className="font-semibold text-base-content">{usuario?.telefono || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-base-content/60">ID de Usuario</p>
                    <p className="font-semibold text-base-content">{usuario?.id || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-base-content/60">Fecha de Registro</p>
                    <p className="font-semibold text-base-content">
                      {usuario?.createdAt ? new Date(usuario.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información profesional (solo para médicos) */}
            {usuario?.rol === "MEDICO" && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-base-content">
                    Información Profesional
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-base-content/60">Especialidad</p>
                      <p className="font-semibold text-base-content">
                        {medico?.especialidad || "No especificada"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-base-content/60">RUT</p>
                      <p className="font-semibold text-base-content">
                        {medico?.rut || "No especificado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-base-content/60">N° de registro</p>
                      <p className="font-semibold text-base-content">
                        {medico?.numeroRegistro || "No especificado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-base-content/60">Universidad</p>
                      <p className="font-semibold text-base-content">
                        {medico?.universidad || "No especificada"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-base-content/60">Experiencia</p>
                      <p className="font-semibold text-base-content">
                        {medico?.experiencia || "No especificada"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-sm text-base-content/60">Dirección</p>
                      <p className="font-semibold text-base-content">
                        {medico?.direccion || "No especificada"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Biografía (solo para médicos) */}
            {usuario?.rol === "MEDICO" && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-base-content">Biografía</h3>
                  <p className="text-base-content/80 leading-relaxed">
                    {medico?.biografia || "No hay biografía disponible."}
                  </p>
                </div>
              </div>
            )}

            {/* Información de acceso */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-base-content">
                  Información de Acceso
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-base-content/60">Tipo de Usuario</p>
                    <p className="font-semibold text-base-content">
                      {usuario?.rol === "MEDICO" ? "Médico" : usuario?.rol || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-base-content/60">Estado</p>
                    <p className="font-semibold text-base-content">
                      <span className="badge badge-success">Activo</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {editMode && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body py-4">
                  <h3 className="card-title text-base-content text-base">Editar información</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="label py-1 text-sm">Nombre</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full"
                        value={formData.nombre || ""}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label py-1 text-sm">Teléfono</label>
                      <input
                        type="tel"
                        className="input input-bordered input-sm w-full"
                        value={formData.telefono || ""}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label py-1 text-sm">Biografía</label>
                      <textarea
                        className="textarea textarea-bordered textarea-sm w-full"
                        rows={3}
                        value={medicoFormData.biografia || ""}
                        onChange={(e) => setMedicoFormData({ ...medicoFormData, biografia: e.target.value })}
                      />
                    </div>
                  </div>
                  {error && <p className="text-error text-sm mt-1">{error}</p>}
                  <div className="flex gap-3 mt-3">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleGuardar}
                      disabled={guardando}
                    >
                      {guardando ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setFormData(usuario || {});
                        setMedicoFormData(medico || {});
                        setEditMode(false);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {passwordMode && (
              <div ref={passwordRef} className="card bg-base-100 shadow-sm">
                <div className="card-body py-4">
                  <h3 className="card-title text-base-content text-base">Cambiar contraseña</h3>
                  <div className="flex flex-col gap-3 mt-2">
                    <div>
                      <label className="label py-1 text-sm">Contraseña actual</label>
                      <input
                        type="password"
                        className="input input-bordered input-sm w-full"
                        value={passwordData.passwordActual}
                        onChange={(e) => setPasswordData({ ...passwordData, passwordActual: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label py-1 text-sm">Nueva contraseña</label>
                      <input
                        type="password"
                        className="input input-bordered input-sm w-full"
                        value={passwordData.passwordNueva}
                        onChange={(e) => setPasswordData({ ...passwordData, passwordNueva: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label py-1 text-sm">Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        className="input input-bordered input-sm w-full"
                        value={passwordData.confirmar}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
                      />
                    </div>
                  </div>
                  {passwordError && <p className="text-error text-sm mt-2">{passwordError}</p>}
                  {passwordExito && <p className="text-success text-sm mt-2">Contraseña actualizada correctamente.</p>}
                  <div className="flex gap-3 mt-3">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleCambiarPassword}
                      disabled={guardandoPassword}
                    >
                      {guardandoPassword ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setPasswordData({ passwordActual: "", passwordNueva: "", confirmar: "" });
                        setPasswordError(null);
                        setPasswordMode(false);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}