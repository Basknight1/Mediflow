import axios from 'axios'
import { msalInstance } from '../auth/msalConfig'
import { loginRequest } from '../auth/loginRequest'
// Reescribimos api.js para la implementación de Microsoft Azure
// ya que necesitamos la validación del token para las peticiones.

// Creamos una constante general para todos los archivos con la ruta del BFF
// para una mayor reducción de código.
export const BFF = "http://localhost:8080/bff"

// Instancia de axios que TODOS los componentes deben usar para hablar con el BFF.
// Reemplaza el axios genérico: agrega automáticamente el token de Azure
// en cada request.
export const api = axios.create({
    baseURL: BFF,
})

api.interceptors.request.use(async (config) => {
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