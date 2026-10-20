import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
})

export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((issue) => issue.msg).filter(Boolean).join(' ')
    }
    if (!error.response) {
      return 'No se pudo conectar con la API. Verifica que el backend esté activo.'
    }
    return `No se pudo completar la solicitud (${error.response.status}).`
  }

  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

export default api
