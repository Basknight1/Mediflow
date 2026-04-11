export default function Navbar({ rol }) {

    const tipos = {
        paciente: ['Inicio', 'Mis Citas', 'Agendar', 'Perfil'],
        medico: ['Inicio', 'Mi Agenda', 'Pacientes', 'Perfil'],
        admin: ['Dashboard', 'Pacientes', 'Medicos', 'Pagos', 'Reportes']
    }

    const linksActuales = tipos[rol]

    return (
        <div className="navbar bg-primary shadow-sm">
            <div className="navbar-start">
                <div className="dropdown lg:hidden">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                        {linksActuales.map((link) => (
                            <li key={link}><a>{link}</a></li>
                        ))}
                    </ul>
                </div>
                <a className="btn btn-ghost text-xl text-primary-content">MediFlow</a>
            </div>
            {/* Links centrados - solo visibles en desktop */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-5 text-primary-content font-bold">
                    {linksActuales.map((link) => (
                        <li key={link}><a>{link}</a></li>
                    ))}
                </ul>
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="Avatar usuario"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                        <li>
                            <a className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><a>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}