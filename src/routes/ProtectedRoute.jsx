import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, rolRequerido }) {
    const { usuario, cargando } = useAuth()

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    if (!usuario) {
        return <Navigate to="/login" />
    }

    if (rolRequerido && usuario.rol !== rolRequerido) {
        return <Navigate to="/login" />
    }

    return children
}
