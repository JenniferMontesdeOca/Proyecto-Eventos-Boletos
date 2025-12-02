// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserPanel from './pages/UserPanel';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategorias from './pages/AdminCategorias';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Profile from './pages/Profile'; // 👈 este es tu componente de perfil

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Navbar siempre visible */}
      <Navbar />

      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/evento/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contacto" element={<Contact />} />

        {/* PERFIL → SOLO LOGGEADO */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* SOLO USUARIO LOGGEADO */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <UserPanel />
            </ProtectedRoute>
          }
        />

        {/* SOLO ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/categorias"
          element={
            <AdminRoute>
              <AdminCategorias />
            </AdminRoute>
          }
        />

        {/* CUALQUIER OTRA RUTA → HOME */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="mt-10 py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Eventos & Boletos
      </footer>
    </div>
  );
}
