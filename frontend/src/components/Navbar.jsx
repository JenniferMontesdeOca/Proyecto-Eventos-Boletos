import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getToken, setToken } from '../api'

export default function Navbar() {
  const isAuth = !!getToken()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function logout() {
    setToken('')
    navigate('/')
  }

  const linkClass = (path) =>
    `text-sm font-medium px-3 py-2 rounded-full transition ${
      pathname === path
        ? 'bg-white text-primary'
        : 'text-slate-100 hover:bg-white/10'
    }`

  return (
    <header className="shadow-sm">
      {/* barra superior de contacto, como Ticketasa */}
      <div className="bg-slate-900 text-[11px] text-slate-200">
        <div className="container flex items-center justify-between h-7">
          <span>servicio@tueventos.com</span>
          <span>+502 0000-0000</span>
        </div>
      </div>

      {/* navbar principal */}
      <div className="bg-primary text-white">
        <div className="container flex items-center justify-between h-16">
          {/* logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-lg font-black tracking-tight">E</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-[0.18em] uppercase">
                Eventos
              </p>
              <p className="text-xs text-slate-200">Tickets Guatemala</p>
            </div>
          </Link>

          {/* links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            <Link to="/faq" className={linkClass('/faq')}>
              FAQ
            </Link>
            <Link to="/contacto" className={linkClass('/contacto')}>
              Contacto
            </Link>
          </nav>

          {/* acciones */}
          <div className="flex items-center gap-2">
            {isAuth ? (
  <>
    <Link to="/panel" className="btn-ghost hidden sm:inline-flex">
      Mis boletos
    </Link>

    {/* 👇 NUEVO BOTÓN - aparece solo si el usuario está loggeado */}
    <Link to="/perfil" className="btn-ghost hidden sm:inline-flex">
      Mi perfil
    </Link>

    <Link to="/admin" className="btn-ghost hidden sm:inline-flex">
      Admin
    </Link>

    <button onClick={logout} className="btn-primary text-xs">
      Cerrar sesión
    </button>
  </>
) : (
              <>
                <Link to="/login" className="btn-ghost text-xs">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="btn-primary text-xs">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
