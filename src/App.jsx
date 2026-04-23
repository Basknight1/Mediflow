import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import HomeAdministrador from './pages/admin/HomeAdministrador'
import HomeMedico from './pages/medico/HomeMedico'
import AgendaMedico from './pages/medico/AgendaMedico'
import PerfilMedico from './pages/medico/PerfilMedico'
import PacientesMedico from './pages/medico/PacientesMedico'
import HomePaciente from './pages/paciente/HomePaciente'
import CitasPaciente from './pages/paciente/CitasPaciente'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <ProtectedRoute rolRequerido="ADMINISTRADOR">
            <HomeAdministrador />
          </ProtectedRoute>
        } />

        <Route path="/medico" element={
          <ProtectedRoute rolRequerido="MEDICO">
            <HomeMedico />
          </ProtectedRoute>
        } />
        <Route path="/medico/mi-agenda" element={
          <ProtectedRoute rolRequerido="MEDICO">
            <AgendaMedico />
          </ProtectedRoute>
        } />
        
        <Route path="/medico/perfil" element={
          <ProtectedRoute rolRequerido="MEDICO">
            <PerfilMedico />
          </ProtectedRoute>
        } />
        <Route path="/medico/pacientes" element={
          <ProtectedRoute rolRequerido="MEDICO">
            <PacientesMedico />
          </ProtectedRoute>
        } />

        <Route path="/paciente" element={
          <ProtectedRoute rolRequerido="PACIENTE">
            <HomePaciente />
          </ProtectedRoute>
        } />
        <Route path="/paciente/mis-citas" element={
          <ProtectedRoute rolRequerido="PACIENTE">
            <CitasPaciente />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
  )
}

export default App