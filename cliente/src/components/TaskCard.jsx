import { Check, Circle, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

function TaskCard({ reserva, onDelete, onToggle, busy }) {
  return (
    <li className="flex min-h-[70px] items-center gap-[13px] rounded-[7px] border border-[#eceee8] px-3 py-[11px] transition hover:border-[#d5ddcf] hover:bg-[#fdfefb] max-sm:gap-[9px] max-sm:p-[9px]">
      <div
        className="grid size-[39px] shrink-0 place-items-center rounded-full bg-[#edf0e8] font-serif text-[17px] text-[#5b7159]"
        aria-hidden="true"
      >
        {reserva.nombre_huesped.trim().charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[7px]">
          <h3 className="m-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-[#344239]">
            {reserva.nombre_huesped}
          </h3>
          <button
            className={`inline-flex items-center gap-1 rounded-full px-[7px] py-[3px] text-[9px] font-bold transition disabled:cursor-wait disabled:opacity-60 ${
              reserva.confirmada
                ? 'bg-[#e9f3e6] text-[#50774a]'
                : 'bg-[#f7f0df] text-[#947638]'
            }`}
            type="button"
            onClick={() => onToggle(reserva)}
            disabled={busy}
            aria-label={`Cambiar estado de la reserva de ${reserva.nombre_huesped}`}
            title="Cambiar estado de confirmación"
          >
            {reserva.confirmada ? (
              <Check aria-hidden="true" size={12} />
            ) : (
              <Circle aria-hidden="true" size={12} />
            )}
            {reserva.confirmada ? 'Confirmada' : 'Pendiente'}
          </button>
        </div>
        <p className="mt-[5px] text-[11px] text-[#848b82]">
          Habitación {reserva.numero_habitacion}
          <span aria-hidden="true"> · </span>
          {reserva.noches} {reserva.noches === 1 ? 'noche' : 'noches'}
        </p>
      </div>
      <div className="flex gap-1">
        <Link
          className="grid size-[31px] place-items-center rounded-[5px] text-[#647465] transition hover:bg-[#eff2ec]"
          to={`/reservas/${encodeURIComponent(reserva.id)}/editar`}
          aria-label={`Editar reserva de ${reserva.nombre_huesped}`}
          title="Editar reserva"
        >
          <Pencil aria-hidden="true" size={16} />
        </Link>
        <button
          className="grid size-[31px] place-items-center rounded-[5px] text-[#a0695e] transition hover:bg-[#fbefec] disabled:cursor-wait disabled:opacity-60"
          type="button"
          onClick={() => onDelete(reserva)}
          disabled={busy}
          aria-label={`Eliminar reserva de ${reserva.nombre_huesped}`}
          title="Eliminar reserva"
        >
          <Trash2 aria-hidden="true" size={17} />
        </button>
      </div>
    </li>
  )
}

export default TaskCard
