import axios from 'axios'
import { msalInstance } from '../auth/msalConfig'
import { loginRequest } from '../auth/loginRequest'
import { fetchAuthSession } from 'aws-amplify/auth'
// Reescribimos api.js para la implementación de Microsoft Azure
// ya que necesitamos la validación del token para las peticiones.
// Se agrega soporte para Cognito (rol PACIENTE) además de Azure.

// Creamos una constante general para todos los archivos con la ruta del BFF
// para una mayor reducción de código.
export const BFF = "http://localhost:8080/bff"

// Instancia de axios que TODOS los componentes deben usar para hablar con el BFF.
// Reemplaza el axios genérico: agrega automáticamente el token de Azure
// o de Cognito (según quién esté logueado) en cada request.
export const api = axios.create({
    baseURL: BFF,
})

api.interceptors.request.use(async (config) => {
    const proveedor = localStorage.getItem('proveedor')

    // Caso Cognito (paciente)
    if (proveedor === 'cognito') {
        try {
            const session = await fetchAuthSession()
            const token = session.tokens?.accessToken?.toString()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        } catch (error) {
            console.error('No se pudo obtener el token de Cognito para la petición:', error)
        }
        return config
    }

    // Caso Azure (médico/admin) — sin cambios respecto a lo que ya tenías
    const cuenta = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0]

    if (!cuenta) {
        return config
    }

    try {
        const respuesta = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: cuenta,
        })
        config.headers.Authorization = `Bearer ${respuesta.accessToken}`
    } catch (error) {
        console.error('No se pudo obtener el token para la petición:', error)
    }

    return config
})