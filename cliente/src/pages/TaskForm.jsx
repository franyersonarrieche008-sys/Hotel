import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  actualizarReserva,
  crearReserva,
  eliminarReserva,
  obtenerReserva,
} from '../api/reservas.js'
import { getApiErrorMessage } from '../api/client.js'

const formularioVacio = {
  nombre_huesped: '',
  numero_habitacion: '',
  noches: '',
  confirmada: false,
}

function TaskForm({ embedded = false, onSaved }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)
  const [formulario, setFormulario] = useState(formularioVacio)
  const [cargando, setCargando] = useState(editando)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return undefined

    let active = true
    async function cargarReserva() {
      try {
        const reserva = await obtenerReserva(id)
        if (!active) return
        setFormulario({
          nombre_huesped: reserva.nombre_huesped,
          numero_habitacion: String(reserva.numero_habitacion),
          noches: String(reserva.noches),
          confirmada: reserva.confirmada,
        })
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError))
      } finally {
        if (active) setCargando(false)
      }
    }

    void cargarReserva()
    return () => {
      active = false
    }
  }, [id])

  function cambiarCampo(event) {
    const { name, value, type, checked } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function cancelar() {
    if (embedded) {
      setFormulario(formularioVacio)
      setError('')
      return
    }
    navigate('/')
  }

  async function guardarReserva(event) {
    event.preventDefault()
    setGuardando(true)
    setError('')

    const datos = {
      nombre_huesped: formulario.nombre_huesped.trim(),
      numero_habitacion: Number(formulario.numero_habitacion),
      noches: Number(formulario.noches),
      confirmada: formulario.confirmada,
    }

    try {
      const reserva = editando
        ? await actualizarReserva(id, datos)
        : await crearReserva(datos)

      if (embedded) {
        onSaved(reserva)
        setFormulario(formularioVacio)
      } else {
        navigate('/', {
          state: {
            notice: editando
              ? 'La reserva se actualizó correctamente.'
              : 'La reserva se creó correctamente.',
          },
        })
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setGuardando(false)
    }
  }

  async function borrarReserva() {
    if (!window.confirm('¿Deseas eliminar esta reserva?')) return

    setEliminando(true)
    setError('')
    try {
      await eliminarReserva(id)
      navigate('/', { state: { notice: 'La reserva se eliminó correctamente.' } })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setEliminando(false)
    }
  }

  const enviando = guardando || eliminando
  const fieldClassName = 'mb-[17px] h-[43px] w-full rounded-[5px] border border-[#e3e4dc] bg-[#fdfdfb] px-3 text-[13px] text-[#293b32] outline-none transition placeholder:text-[#a5aaa1] focus:border-[#819479] focus:ring-[3px] focus:ring-[#819479]/15 disabled:opacity-60'
  const labelClassName = 'mb-[7px] block text-xs font-bold text-[#3e4941]'

  const form = (
    <>
      {error && (
        <p className="mb-4 rounded-md border border-[#edc5bc] bg-[#fff3ef] px-3 py-2 text-[13px] text-[#9e3d2e]" role="alert">
          {error}
        </p>
      )}
      {cargando ? (
        <div className="py-8 text-center text-xs text-[#8b9288]" role="status">
          Cargando reserva…
        </div>
      ) : (
        <form onSubmit={guardarReserva}>
          <label className={labelClassName} htmlFor="nombre_huesped">
            Nombre del huésped
          </label>
          <input
            className={fieldClassName}
            id="nombre_huesped"
            name="nombre_huesped"
            type="text"
            autoComplete="name"
            placeholder="Ej. Ana Pérez"
            value={formulario.nombre_huesped}
            onChange={cambiarCampo}
            maxLength={120}
            required
            disabled={enviando}
          />

          <div className="grid grid-cols-2 gap-[13px]">
            <div>
              <label className={labelClassName} htmlFor="numero_habitacion">
                Habitación
              </label>
              <input
                className={fieldClassName}
                id="numero_habitacion"
                name="numero_habitacion"
                type="number"
                min="1"
                step="1"
                placeholder="Ej. 12"
                value={formulario.numero_habitacion}
                onChange={cambiarCampo}
                required
                disabled={enviando}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="noches">
                Noches
              </label>
              <input
                className={fieldClassName}
                id="noches"
                name="noches"
                type="number"
                min="1"
                step="1"
                placeholder="Ej. 3"
                value={formulario.noches}
                onChange={cambiarCampo}
                required
                disabled={enviando}
              />
            </div>
          </div>

          <label className="mb-[21px] mt-px flex cursor-pointer items-start gap-[10px]">
            <input
              className="mt-0.5 size-4 accent-[#506b53]"
              name="confirmada"
              type="checkbox"
              checked={formulario.confirmada}
              onChange={cambiarCampo}
              disabled={enviando}
            />
            <span>
              <strong className="block text-xs text-[#3e4941]">Reserva confirmada</strong>
              <small className="mt-[3px] block text-[11px] leading-[1.4] text-[#8a9188]">
                Marca esta opción si la estancia está confirmada.
              </small>
            </span>
          </label>

          <div className="flex gap-[9px]">
            <button
              className="min-h-[42px] flex-1 rounded-[5px] bg-[#3f5e48] px-[15px] text-xs font-bold text-white transition hover:bg-[#324d3a] disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={enviando}
            >
              {guardando
                ? 'Guardando…'
                : eliminando
                  ? 'Eliminando…'
                : editando
                  ? 'Guardar cambios'
                  : 'Crear reserva'}
            </button>
            {editando && (
              <>
                <button
                  className="grid min-h-[42px] min-w-[42px] place-items-center rounded-[5px] border border-[#edc5bc] bg-white px-3 text-[#a0695e] transition hover:bg-[#fbefec] disabled:opacity-60"
                  type="button"
                  onClick={borrarReserva}
                  disabled={enviando}
                  aria-label="Eliminar reserva"
                  title="Eliminar reserva"
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
                <button
                  className="min-h-[42px] rounded-[5px] border border-[#dfe3da] bg-white px-[15px] text-xs font-bold text-[#526252] transition hover:bg-[#f4f6f1] disabled:opacity-60"
                  type="button"
                  onClick={cancelar}
                  disabled={enviando}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </>
  )

  if (embedded) return form

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-48px))] py-[30px] max-sm:w-[calc(100%-24px)]">
      <section className="mx-auto max-w-[520px] rounded-[10px] border border-[#e9e5df] bg-white p-[25px] max-sm:p-[21px] max-[440px]:p-[17px]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-[5px] text-[10px] font-bold tracking-[1.7px] text-[#9da989]">
              {editando ? 'MODIFICAR' : 'NUEVA ESTANCIA'}
            </p>
            <h1 className="m-0 font-serif text-2xl font-normal text-[#283b32]">
              {editando ? 'Editar reserva' : 'Crear reserva'}
            </h1>
          </div>
          <Link
            className="text-xs font-bold text-[#526252] underline decoration-[#cbd4c4] underline-offset-4"
            to="/"
          >
            Volver a reservas
          </Link>
        </div>
        {form}
      </section>
    </main>
  )
}

export default TaskForm
