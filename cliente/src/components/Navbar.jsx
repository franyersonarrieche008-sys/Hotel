import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="mx-auto flex min-h-[82px] w-[min(1120px,calc(100%-48px))] items-center justify-between border-b border-[#e9e5df] max-sm:min-h-[70px] max-sm:w-[calc(100%-24px)]">
      <Link
        className="inline-flex items-center gap-3 font-serif text-xl font-bold leading-none text-[#253a32] no-underline"
        to="/"
        aria-label="Inicio de Casa Serena"
      >
        <span className="grid size-[42px] place-items-center rounded-full border border-[#9caa8c] font-serif text-sm font-normal tracking-[-1px] text-[#536e57]">
          CS
        </span>
        <span>
          Casa Serena
          <small className="mt-[5px] block font-sans text-[9px] font-bold tracking-[1.5px] text-[#8a8d7f]">
            HOTEL &amp; HOSTAL
          </small>
        </span>
      </Link>
      <Link
        className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#3f5e48] px-3 text-xs font-bold text-white transition hover:bg-[#324d3a] max-sm:px-2"
        to="/reservas/nueva"
      >
        <Plus aria-hidden="true" size={16} />
        <span className="max-[400px]:hidden">Nueva reserva</span>
      </Link>
    </header>
  )
}

export default Navbar
