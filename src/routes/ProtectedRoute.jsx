import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, rolRequerido }) {
    const { usuario } = useAuth()

    if (!usuario) { // Si no hay usuario logeado, lo redirijo al login
        return <Navigate to="/login" />
    }

    if (rolRequerido && usuario.rol !== rolRequerido) { // Si el rol no coincide, lo redirijo al login
        return <Navigate to="/login" />
    }

    return children
}