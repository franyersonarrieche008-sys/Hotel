import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Homepage from './pages/Homepage.jsx'
import TaskForm from './pages/TaskForm.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fbfaf7] text-[#4d564d]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/reservas/nueva" element={<TaskForm />} />
          <Route path="/reservas/:id/editar" element={<TaskForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
