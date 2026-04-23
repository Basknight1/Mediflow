// ─── Lista de médicos hardcodeada (temporal) ───
// En un futuro se obtendrá del backend cuando el Administrador
// pueda registrar médicos con su especialidad.

export const medicos = [
    { id: 1, nombre: "Dra. Ana López", especialidad: "Dermatología" },
    { id: 2, nombre: "Dr. Carlos Ruiz", especialidad: "Cardiología" },
    { id: 3, nombre: "Dra. María Paz Soler", especialidad: "Psicología" },
    { id: 4, nombre: "Dr. José Contreras", especialidad: "Traumatología" },
    { id: 5, nombre: "Dra. Valentina Torres", especialidad: "Medicina General" },
    { id: 6, nombre: "Dr. Rodrigo Valdés", especialidad: "Neurología" },
];

// Mapeo rápido: medicoId → nombre del doctor
export const medicosMap = Object.fromEntries(
    medicos.map((m) => [m.id, m.nombre])
);

// Mapeo rápido: medicoId → especialidad
export const medicosEspecialidadMap = Object.fromEntries(
    medicos.map((m) => [m.id, m.especialidad])
);
