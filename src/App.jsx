import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import HomeMedico from './pages/medico/HomeMedico'
import AgendaMedico from './pages/medico/AgendaMedico'
import PerfilMedico from './pages/medico/PerfilMedico'
import PacientesMedico from './pages/medico/PacientesMedico'
import HomePaciente from './pages/paciente/HomePaciente'
import ProtectedRoute from './routes/ProtectedRoute'
import AgendarCita from './pages/paciente/AgendarCita'
import CitasPaciente from './pages/paciente/CitasPaciente'
import MiFichaPaciente from './pages/paciente/MiFichaPaciente'
import MiPerfilPaciente from './pages/paciente/MiPerfilPaciente'
import HomeAdmin from './pages/admin/HomeAdmin'
import PacientesAdmin from './pages/admin/PacientesAdmin'
import MedicosAdmin from './pages/admin/MedicosAdmin'
import CitasYPagosAdmin from './pages/admin/CitasYPagosAdmin'
import ReportesAdmin from './pages/admin/ReportesAdmin'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={
        <ProtectedRoute rolRequerido="ADMINISTRADOR">
          <HomeAdmin />
        </ProtectedRoute>
      } />

      <Route path="/admin/pacientes" element={
        <ProtectedRoute rolRequerido="ADMINISTRADOR">
          <PacientesAdmin />
        </ProtectedRoute>
      } />

      <Route path="/admin/medicos" element={
        <ProtectedRoute rolRequerido="ADMINISTRADOR">
          <MedicosAdmin />
        </ProtectedRoute>
      } />

      <Route path="/admin/citas-pagos" element={
        <ProtectedRoute rolRequerido="ADMINISTRADOR">
          <CitasYPagosAdmin />
        </ProtectedRoute>
      } />

      <Route path="/admin/reportes" element={
        <ProtectedRoute rolRequerido="ADMINISTRADOR">
          <ReportesAdmin />
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

      <Route path="/paciente/agendar" element={
        <ProtectedRoute rolRequerido="PACIENTE">
          <AgendarCita />
        </ProtectedRoute>
      } />

      <Route path="/paciente/ficha" element={
        <ProtectedRoute rolRequerido="PACIENTE">
          <MiFichaPaciente />
        </ProtectedRoute>
      } />

      <Route path="/paciente/perfil" element={
        <ProtectedRoute rolRequerido="PACIENTE">
          <MiPerfilPaciente />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes >
  )
}

export default App
