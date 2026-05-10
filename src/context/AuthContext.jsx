import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export default function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [medico, setMedico] = useState(null)
    const [cargando, setCargando] = useState(true)

    // Cargar usuario desde localStorage al iniciar
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario')
        if (usuarioGuardado) {
            try {
                const usuarioParseado = JSON.parse(usuarioGuardado)
                setUsuario(usuarioParseado)

                if (usuarioParseado.rol === "MEDICO") {
                    const medicoGuardado = localStorage.getItem('medico')
                    if (medicoGuardado) {
                        setMedico(JSON.parse(medicoGuardado))
                    }
                }
            } catch (error) {
                localStorage.removeItem('usuario')
                localStorage.removeItem('medico')
            }
        }
        setCargando(false)
    }, [])

    const login = async (datos) => {
        // Separar datos básicos de datos de médico
        const usuarioBasico = {
            id: datos.id,
            nombre: datos.nombre,
            email: datos.email,
            rol: datos.rol,
            rut: datos.rut,
            telefono: datos.telefono,
            prevision: datos.prevision,
            createdAt: datos.createdAt,
            genero: datos.genero,
            direccion: datos.direccion,
            contactoEmergenciaNombre: datos.contactoEmergenciaNombre,
            contactoEmergenciaTelefono: datos.contactoEmergenciaTelefono,
            // Solo paciente
            fechaNacimiento: datos.fechaNacimiento,
            alergias: datos.alergias,
            enfermedadesCronicas: datos.enfermedadesCronicas,
            tipoSangre: datos.tipoSangre,
        }

        // Extraer datos específicos de médico
        let medicoDatos = null
        if (datos.rol === "MEDICO") {
            const src = datos.medico || datos
            medicoDatos = {
                id: datos.id,
                especialidad: src.especialidad,
                rut: src.rut || datos.rut,
                numeroRegistro: src.numeroRegistro,
                universidad: src.universidad,
                experiencia: src.experiencia,
                direccion: src.direccion,
                biografia: src.biografia,
                horaInicio: src.horaInicio,
                horaFin: src.horaFin
            }
        }

        setUsuario(usuarioBasico)
        localStorage.setItem('usuario', JSON.stringify(usuarioBasico))

        // Guardar datos del médico si existen
        if (medicoDatos) {
            setMedico(medicoDatos)
            localStorage.setItem('medico', JSON.stringify(medicoDatos))
        }

        console.log("Sesión iniciada:", { usuario: usuarioBasico, medico: medicoDatos })
    }

    const logout = () => {
        setUsuario(null)
        setMedico(null)
        localStorage.removeItem('usuario')
        localStorage.removeItem('medico')
        console.log("Sesión cerrada")
    }

    const updateMedico = (datosMedico) => {
        setMedico(datosMedico)
        localStorage.setItem('medico', JSON.stringify(datosMedico))
    }

    const updateUsuario = (datosUsuario) => {
        setUsuario(datosUsuario)
        localStorage.setItem('usuario', JSON.stringify(datosUsuario))
    }

    return (
        <AuthContext.Provider value={{ usuario, medico, cargando, login, logout, updateMedico, updateUsuario }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}