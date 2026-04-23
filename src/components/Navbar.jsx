import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linksPorRol = {
    PACIENTE: [
        { nombre: "Inicio", ruta: "/paciente" },
        { nombre: "Mis Citas", ruta: "/paciente/mis-citas" },
        { nombre: "Agendar", ruta: "/paciente/agendar" },
        { nombre: "Perfil", ruta: "/paciente/perfil" },
    ],
    MEDICO: [
        { nombre: "Inicio", ruta: "/medico" },
        { nombre: "Mi Agenda", ruta: "/medico/mi-agenda" },
        { nombre: "Pacientes", ruta: "/medico/pacientes" },
        { nombre: "Perfil", ruta: "/medico/perfil" },
        
    ],
    ADMINISTRADOR: [
        { nombre: "Dashboard", ruta: "/admin" },
        { nombre: "Pacientes", ruta: "/admin/pacientes" },
        { nombre: "Medicos", ruta: "/admin/medicos" },
        { nombre: "Pagos", ruta: "/admin/pagos" },
        { nombre: "Reportes", ruta: "/admin/reportes" },
    ],
};

export default function Navbar() {
    const { usuario, logout } = useAuth();
    const { pathname } = useLocation();
    const links = linksPorRol[usuario?.rol] || [];

    return (
        <div className="navbar bg-primary shadow-sm">
            <div className="navbar-start">
                {/* Menu hamburguesa - solo mobile */}
                <div className="dropdown lg:hidden">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                        {links.map((link) => (
                            <li key={link.ruta}>
                                <Link to={link.ruta}>{link.nombre}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl text-primary-content">MediFlow</Link>
            </div>

            {/* Links centrados - solo desktop */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-5 text-primary-content font-bold gap-2">
                    {links.map((link) => {
                        const activo = pathname === link.ruta;
                        return (
                            <li key={link.ruta}>
                                <Link
                                    to={link.ruta}
                                    className={activo
                                        ? "bg-primary-content text-primary rounded-lg"
                                        : "text-white hover:bg-primary-focus"
                                    }
                                >
                                    {link.nombre}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Avatar y dropdown usuario */}
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                        <div className="bg-primary-content text-primary rounded-full w-10 flex items-center justify-center font-bold text-sm">
                            {(usuario?.nombre || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                        <li><span className="font-bold">{usuario?.nombre}</span></li>
                        <li><a onClick={logout}>Cerrar sesion</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
