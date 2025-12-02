// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api, setToken } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const data = await Api.login(email, password);
      // { token, user: { id, nombre, email, rol_id } }

      // 🔐 guardar token
      setToken(data.token);

      // 👤 guardar usuario (incluye rol_id)
      localStorage.setItem('user', JSON.stringify(data.user));

      // si es admin → panel admin, si no → home
      if (data.user.rol_id === 3) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión');
    }
  }

  return (
    <div className="container py-10 flex justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold text-center">Entrar</h1>

        <input
          className="input"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full">
          Ingresar
        </button>
      </form>
    </div>
  );
}
