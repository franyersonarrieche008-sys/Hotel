import { House } from 'lucide-react'
import TaskCard from './TaskCard.jsx'

function TaskList({ reservas, cargando, onDelete, onToggle, busyId }) {
  if (cargando) {
    return (
      <div
        className="flex min-h-[205px] items-center justify-center rounded-[7px] border border-dashed border-[#dfe5da] text-center text-xs text-[#8b9288]"
        role="status"
      >
        Cargando reservas…
      </div>
    )
  }

  if (reservas.length === 0) {
    return (
      <div className="flex min-h-[205px] flex-col items-center justify-center rounded-[7px] border border-dashed border-[#dfe5da] text-center text-xs text-[#8b9288]">
        <House aria-hidden="true" className="mb-2 text-[#82917c]" size={32} />
        <h3 className="mb-[5px] font-serif text-[17px] font-normal text-[#465447]">
          Aún no hay reservas
        </h3>
        <p>Cuando registres una estancia, aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <ul className="m-0 grid list-none gap-[10px] p-0">
      {reservas.map((reserva) => (
        <TaskCard
          key={reserva.id}
          reserva={reserva}
          onDelete={onDelete}
          onToggle={onToggle}
          busy={busyId === reserva.id}
        />
      ))}
    </ul>
  )
}

export default TaskList
