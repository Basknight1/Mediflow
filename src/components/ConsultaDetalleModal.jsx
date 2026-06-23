function formatearFechaCompleta(fechaStr) {
  if (!fechaStr) return "Sin fecha";
  return new Date(`${fechaStr}T00:00:00`).toLocaleDateString("es-CL");
}

function formatearHora(horaStr) {
  if (!horaStr) return "Sin hora";
  return horaStr.substring(0, 5);
}

export default function ConsultaDetalleModal({ cita, registro, onClose, doctorNombre, especialidad }) {
  if (!cita || !registro) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-xl mb-5">Detalle de la atencion</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Medico</p>
            <p className="font-semibold">{doctorNombre || "No disponible"}</p>
          </div>
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Especialidad</p>
            <p className="font-semibold">{especialidad || cita.tipo || "No disponible"}</p>
          </div>
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Fecha</p>
            <p className="font-semibold">{formatearFechaCompleta(registro.fechaCita || cita.fecha)}</p>
          </div>
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Hora</p>
            <p className="font-semibold">{formatearHora(cita.hora)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Motivo de consulta</p>
            <p>{registro.motivoConsulta || cita.motivo || "Sin motivo registrado"}</p>
          </div>
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Observaciones de la atencion</p>
            <p>{registro.observaciones || "Sin observaciones"}</p>
          </div>
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Diagnostico o resumen</p>
            <p>{registro.diagnostico || "Sin diagnostico"}</p>
          </div>
          <div className="bg-base-200 rounded-xl p-4">
            <p className="text-sm text-base-content/60 mb-1">Indicaciones</p>
            <p>{registro.indicaciones || "Sin indicaciones"}</p>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
