import api from './client.js'

export async function listarReservas() {
  const { data } = await api.get('/reservas')
  return data
}

export async function obtenerReserva(id) {
  const { data } = await api.get(`/reservas/${encodeURIComponent(id)}`)
  return data
}

export async function crearReserva(reserva) {
  const { data } = await api.post('/reservas', reserva)
  return data
}

export async function actualizarReserva(id, reserva) {
  const { data } = await api.put(`/reservas/${encodeURIComponent(id)}`, reserva)
  return data
}

export async function actualizarReservaParcial(id, cambios) {
  const { data } = await api.patch(`/reservas/${encodeURIComponent(id)}`, cambios)
  return data
}

export async function eliminarReserva(id) {
  await api.delete(`/reservas/${encodeURIComponent(id)}`)
}
