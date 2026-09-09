# proyecto-mediflow — Frontend MediFlow

Aplicación frontend del sistema MediFlow. Interfaz de usuario para la gestión de citas médicas, desarrollada en React con autenticación JWT y comunicación exclusiva a través del BFF.

## Tecnologías
- React 19
- React Router DOM 7
- Axios
- Tailwind CSS 4
- DaisyUI 5
- Vite 8

## Requisitos previos
- Node.js instalado
- BFF corriendo en puerto 8080

## Instalación y ejecución
```bash
# Clonar el repositorio
git clone https://github.com/benjota69/proyecto-mediflow.git

# Entrar al directorio
cd proyecto-mediflow

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación quedará disponible en: `http://localhost:5173`

## Scripts disponibles
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Ejecutar en modo desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Previsualizar build de producción |
| `npm run lint` | Ejecutar linter |

## Funcionalidades por rol
- **Administrador**: Dashboard general, gestión de pacientes y médicos, visualización de pagos
- **Médico**: Agenda de citas, cambio de estado de citas, registro de consultas
- **Paciente**: Agendamiento de citas, visualización de pagos, historial de consultas

## Arquitectura
El frontend se comunica **exclusivamente** con el BFF (`http://localhost:8080/bff`). Nunca llama directamente a los microservicios. La autenticación usa JWT almacenado en localStorage.

## Estructura del proyecto
```
src/
├── components/    # Componentes reutilizables
├── pages/         # Vistas por rol (admin, médico, paciente)
├── services/      # Llamadas HTTP con Axios al BFF
└── assets/        # Recursos estáticos
```
