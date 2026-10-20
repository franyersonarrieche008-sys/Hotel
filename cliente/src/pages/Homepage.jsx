import { useEffect, useState } from 'react'
import { BedDouble, Check, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { actualizarReserva, eliminarReserva, listarReservas } from '../api/reservas.js'
import { getApiErrorMessage } from '../api/client.js'
import TaskList from '../components/TaskList.jsx'
import TaskForm from './TaskForm.jsx'

function Homepage() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const location = useLocation()
  const [aviso, setAviso] = useState(location.state?.notice ?? '')

  useEffect(() => {
    let active = true

    async function cargarReservas() {
      try {
        const datos = await listarReservas()
        if (active) setReservas(datos)
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError))
      } finally {
        if (active) setCargando(false)
      }
    }

    void cargarReservas()
    return () => {
      active = false
    }
  }, [])

  function agregarReserva(reserva) {
    setReservas((actuales) => [reserva, ...actuales])
    setError('')
    setAviso('La reserva se creó correctamente.')
  }

  async function cambiarEstado(reserva) {
    setBusyId(reserva.id)
    setError('')
    setAviso('')

    try {
      const actualizada = await actualizarReserva(reserva.id, {
        nombre_huesped: reserva.nombre_huesped,
        numero_habitacion: reserva.numero_habitacion,
        noches: reserva.noches,
        confirmada: !reserva.confirmada,
      })
      setReservas((actuales) =>
        actuales.map((actual) => actual.id === actualizada.id ? actualizada : actual),
      )
      setAviso(
        actualizada.confirmada
          ? 'La reserva quedó confirmada.'
          : 'La reserva quedó pendiente.',
      )
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setBusyId(null)
    }
  }

  async function borrarReserva(reserva) {
    if (!window.confirm(`¿Deseas eliminar la reserva de ${reserva.nombre_huesped}?`)) {
      return
    }

    setBusyId(reserva.id)
    setError('')
    setAviso('')
    try {
      await eliminarReserva(reserva.id)
      setReservas((actuales) => actuales.filter((actual) => actual.id !== reserva.id))
      setAviso('La reserva se eliminó correctamente.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setBusyId(null)
    }
  }

  const confirmadas = reservas.filter((reserva) => reserva.confirmada).length

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-48px))] max-sm:w-[calc(100%-24px)]">
      <section className="my-[30px] flex min-h-[214px] items-center justify-between overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_90%_15%,rgba(218,222,198,.5),transparent_33%),linear-gradient(115deg,#283d34_0%,#3d5947_62%,#67775d_100%)] px-[42px] py-[35px] text-white max-sm:my-5 max-sm:min-h-[190px] max-sm:px-6 max-sm:py-[27px] max-[440px]:px-[18px]">
        <div>
          <p className="mb-[9px] text-[10px] font-bold tracking-[1.7px] text-[#d1d9bf]">
            BIENVENIDO A CASA SERENA
          </p>
          <h1 className="m-0 max-w-[560px] font-serif text-[clamp(30px,4vw,43px)] font-normal leading-[1.15] tracking-[-.7px] text-white">
            Una estancia bien organizada.
          </h1>
          <p className="mt-3 text-sm text-[#d8dfd1] max-[440px]:max-w-[240px] max-[440px]:text-xs">
            Administra las reservas de tus huéspedes desde un solo lugar.
          </p>
        </div>
        <div
          className="mr-[30px] grid size-[122px] shrink-0 place-items-center rounded-full border border-[rgba(235,237,220,.45)] font-serif text-[76px] leading-none text-[rgba(238,239,223,.85)] max-sm:mr-0 max-sm:size-[82px] max-sm:text-[53px] max-[440px]:ml-[10px] max-[440px]:size-[60px] max-[440px]:text-[40px]"
          aria-hidden="true"
        >
          <span>⌂</span>
        </div>
      </section>

      {error && (
        <p className="mb-5 mt-[-13px] rounded-md border border-[#edc5bc] bg-[#fff3ef] px-[15px] py-3 text-[13px] text-[#9e3d2e]" role="alert">
          {error}
        </p>
      )}
      {aviso && (
        <p className="mb-5 mt-[-13px] rounded-md border border-[#cbdcc6] bg-[#f1f7ed] px-[15px] py-3 text-[13px] text-[#456c40]" role="status">
          {aviso}
        </p>
      )}

      <section
        className="grid grid-cols-[minmax(290px,350px)_minmax(0,1fr)] items-start gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-4"
        aria-label="Administración de reservas"
      >
        <aside className="rounded-[10px] border border-[#e9e5df] bg-white p-[25px] max-[760px]:p-[21px] max-[440px]:p-[17px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-[5px] text-[10px] font-bold tracking-[1.7px] text-[#9da989]">
                NUEVA ESTANCIA
              </p>
              <h2 className="m-0 font-serif text-2xl font-normal text-[#283b32]">
                Crear reserva
              </h2>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-[#f0f3eb] text-[#60765e]">
              <Sparkles aria-hidden="true" size={18} />
            </span>
          </div>
          <TaskForm embedded onSaved={agregarReserva} />
        </aside>

        <section className="min-h-[430px] rounded-[10px] border border-[#e9e5df] bg-white px-[27px] py-[25px] max-[760px]:p-[21px] max-[440px]:p-[17px]">
          <div className="mb-[18px] flex items-center justify-between">
            <div>
              <p className="mb-[5px] text-[10px] font-bold tracking-[1.7px] text-[#9da989]">
                ALOJAMIENTO
              </p>
              <h2 className="m-0 font-serif text-2xl font-normal text-[#283b32]">
                Reservas
              </h2>
            </div>
            <span className="rounded-full bg-[#f0f3eb] px-[10px] py-[6px] text-[11px] font-bold text-[#60745e]">
              {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'}
            </span>
          </div>

          <div className="mb-[19px] grid grid-cols-2 gap-3">
            <div className="flex min-h-[68px] items-center gap-3 rounded-[7px] border border-[#eceee7] bg-[#fcfcfa] px-[14px]">
              <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#eef1e8] text-[#63785f]">
                <BedDouble aria-hidden="true" size={17} />
              </span>
              <span>
                <strong className="block text-lg leading-[1.2] text-[#334338]">{reservas.length}</strong>
                <small className="mt-[3px] block text-[10px] text-[#858c82]">En total</small>
              </span>
            </div>
            <div className="flex min-h-[68px] items-center gap-3 rounded-[7px] border border-[#eceee7] bg-[#fcfcfa] px-[14px]">
              <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#e8f2e6] text-[#588051]">
                <Check aria-hidden="true" size={17} />
              </span>
              <span>
                <strong className="block text-lg leading-[1.2] text-[#334338]">{confirmadas}</strong>
                <small className="mt-[3px] block text-[10px] text-[#858c82]">Confirmadas</small>
              </span>
            </div>
          </div>

          <TaskList
            reservas={reservas}
            cargando={cargando}
            onDelete={borrarReserva}
            onToggle={cambiarEstado}
            busyId={busyId}
          />
        </section>
      </section>

      <footer className="py-[29px] pb-5 text-center text-[11px] text-[#92988f]">
        Casa Serena <span className="px-1 text-[#a8b29e]">·</span>
        Hospitalidad que se siente como en casa
      </footer>
    </main>
  )
}

export default Homepage
