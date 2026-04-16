import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import HomeAdministrador from './pages/admin/HomeAdministrador'
import HomeMedico from './pages/medico/HomeMedico'
import HomePaciente from './pages/paciente/HomePaciente'
import ProtectedRoute from './routes/ProtectedRoute'
import CitasPaciente from './pages/paciente/CitasPaciente'

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