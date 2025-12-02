import { useEffect, useState } from 'react'
import { getToken } from '../api'

const API_BASE = 'http://localhost:5000'

export default function AdminDashboard() {
  const token = getToken()

  // --------- ESTADOS GENERALES ----------
  const [stats, setStats] = useState({ eventos: 0, usuarios: 0, ventas: 0 })
  const [activeTab, setActiveTab] = useState('eventos')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // --------- EVENTOS ----------
  const [events, setEvents] = useState([])
  const [categorias, setCategorias] = useState([])

  const [eventForm, setEventForm] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    capacidad_total: 0,
    boletos_disponibles: 0,
    categoria_id: '',
    precio_base: '',
    localidad_principal: '',
  })
  const [editingEventId, setEditingEventId] = useState(null)

  // --------- IMÁGENES DE EVENTO ----------
  const [selectedEventForImages, setSelectedEventForImages] = useState(null)
  const [eventImages, setEventImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // --------- LOCALIDADES / PRECIOS ----------
  const [selectedEventForLocalities, setSelectedEventForLocalities] =
    useState(null)
  const [localities, setLocalities] = useState([])
  const [localityForm, setLocalityForm] = useState({
    nombre: '',
    precio: '',
    capacidad: '',
    boletos_disponibles: '',
  })
  const [editingLocalityId, setEditingLocalityId] = useState(null)

  // --------- CATEGORÍAS ----------
  const [categoriaNombre, setCategoriaNombre] = useState('')
  const [editingCategoriaId, setEditingCategoriaId] = useState(null)
  const [editingCategoriaNombre, setEditingCategoriaNombre] = useState('')

  // --------- USUARIOS ----------
  const [users, setUsers] = useState([])
  const [roles] = useState([
    { id: 1, nombre: 'cliente' },
    { id: 2, nombre: 'organizador' },
    { id: 3, nombre: 'administrador' },
  ])

  // --------- HELPERS ----------
  function authHeaders(json = true) {
    const h = {}
    if (json) h['Content-Type'] = 'application/json'
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
  }

  // ===================== LOADERS =====================
  async function loadStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: authHeaders(false),
      })
      if (!res.ok) return
      const data = await res.json()
      setStats({
        eventos: data.eventos ?? 0,
        usuarios: data.usuarios ?? 0,
        ventas: data.ventas ?? 0,
      })
    } catch (err) {
      console.error(err)
    }
  }

  async function loadEvents() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/events?page=1&limit=100`)
      if (!res.ok) throw new Error('Error al cargar eventos')
      const data = await res.json()
      setEvents(data.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategorias() {
    try {
      const res = await fetch(`${API_BASE}/categorias`)
      if (!res.ok) throw new Error('Error al cargar categorías')
      const data = await res.json()
      setCategorias(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: authHeaders(false),
      })
      if (!res.ok) return
      const data = await res.json()
      setUsers(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadStats()
    loadEvents()
    loadCategorias()
    loadUsers()
  }, [])

  // ===================== EVENTOS (CRUD) =====================

  function resetEventForm() {
    setEventForm({
      nombre: '',
      descripcion: '',
      fecha: '',
      hora: '',
      ubicacion: '',
      capacidad_total: 0,
      boletos_disponibles: 0,
      categoria_id: '',
      precio_base: '',
      localidad_principal: '',
    })
    setEditingEventId(null)
  }

  function startEditEvent(ev) {
    setEditingEventId(ev.id)
    setEventForm({
      nombre: ev.nombre || '',
      descripcion: ev.descripcion || '',
      fecha: ev.fecha || '',
      hora: ev.hora || '',
      ubicacion: ev.ubicacion || '',
      capacidad_total: ev.capacidad_total || 0,
      boletos_disponibles: ev.boletos_disponibles || 0,
      categoria_id: ev.categoria_id || '',
      precio_base: ev.precio_base || '',
      localidad_principal: ev.localidad_principal || '',
    })
    setActiveTab('eventos')
  }

  async function handleSaveEvent(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      const payload = {
        ...eventForm,
        capacidad_total: Number(eventForm.capacidad_total) || 0,
        boletos_disponibles: Number(eventForm.boletos_disponibles) || 0,
        precio_base:
          eventForm.precio_base === ''
            ? null
            : Number(eventForm.precio_base),
        // 🔥 IMPORTANTE: enviar categoria_id como número
        categoria_id: eventForm.categoria_id
          ? Number(eventForm.categoria_id)
          : null,
      }

      const url = editingEventId
        ? `${API_BASE}/events/${editingEventId}`
        : `${API_BASE}/events`
      const method = editingEventId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'No se pudo guardar el evento')
      }

      resetEventForm()
      await loadEvents()
      await loadStats()
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteEvent(id) {
    if (!window.confirm('¿Eliminar este evento?')) return
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders(false),
      })
      if (!res.ok) throw new Error('No se pudo eliminar el evento')

      if (selectedEventForImages?.id === id) {
        setSelectedEventForImages(null)
        setEventImages([])
      }
      if (selectedEventForLocalities?.id === id) {
        setSelectedEventForLocalities(null)
        setLocalities([])
      }

      await loadEvents()
      await loadStats()
    } catch (err) {
      alert(err.message)
    }
  }

  // ===================== IMÁGENES POR EVENTO =====================

  async function loadEventImages(eventId) {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/imagenes`)
      if (!res.ok) {
        setEventImages([])
        return
      }
      const data = await res.json()
      setEventImages(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSelectEventImages(ev) {
    setSelectedEventForImages(ev)
    await loadEventImages(ev.id)
  }

  async function handleUploadImages(e) {
    const files = Array.from(e.target.files || [])
    if (!selectedEventForImages || files.length === 0) return

    try {
      setUploadingImages(true)

      const fd = new FormData()
      files.forEach((file) => {
        // 👇 nombre de campo correcto para multer: upload.array('imagenes', 10)
        fd.append('imagenes', file)
      })

      const res = await fetch(
        `${API_BASE}/events/${selectedEventForImages.id}/imagenes`,
        {
          method: 'POST',
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
          body: fd,
        }
      )

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Error al subir imagen')
      }

      await loadEventImages(selectedEventForImages.id)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  async function handleDeleteImage(id) {
    if (!window.confirm('¿Eliminar esta imagen?')) return
    try {
      const res = await fetch(`${API_BASE}/imagenes/${id}`, {
        method: 'DELETE',
        headers: authHeaders(false),
      })
      if (!res.ok) throw new Error('No se pudo eliminar la imagen')
      await loadEventImages(selectedEventForImages.id)
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleMakePrincipal(id) {
    try {
      const res = await fetch(`${API_BASE}/imagenes/${id}/principal`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ es_principal: true }),
      })
      if (!res.ok) throw new Error('No se pudo marcar como principal')
      await loadEventImages(selectedEventForImages.id)
    } catch (err) {
      alert(err.message)
    }
  }

  // ===================== LOCALIDADES / PRECIOS =====================

  async function loadLocalities(eventId) {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/localidades`)
      if (!res.ok) {
        setLocalities([])
        return
      }
      const data = await res.json()
      setLocalities(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSelectEventLocalities(ev) {
    setSelectedEventForLocalities(ev)
    setEditingLocalityId(null)
    setLocalityForm({
      nombre: '',
      precio: '',
      capacidad: '',
      boletos_disponibles: '',
    })
    await loadLocalities(ev.id)
  }

  function startEditLocality(loc) {
    setEditingLocalityId(loc.id)
    setLocalityForm({
      nombre: loc.nombre,
      precio: loc.precio,
      capacidad: loc.capacidad,
      boletos_disponibles: loc.boletos_disponibles,
    })
  }

  function resetLocalityForm() {
    setEditingLocalityId(null)
    setLocalityForm({
      nombre: '',
      precio: '',
      capacidad: '',
      boletos_disponibles: '',
    })
  }

  async function handleSaveLocality(e) {
    e.preventDefault()
    if (!selectedEventForLocalities) return

    const payload = {
      nombre: localityForm.nombre,
      precio: Number(localityForm.precio),
      capacidad: Number(localityForm.capacidad) || 0,
      boletos_disponibles:
        localityForm.boletos_disponibles === ''
          ? Number(localityForm.capacidad) || 0
          : Number(localityForm.boletos_disponibles),
    }

    try {
      const url = editingLocalityId
        ? `${API_BASE}/localidades/${editingLocalityId}`
        : `${API_BASE}/events/${selectedEventForLocalities.id}/localidades`
      const method = editingLocalityId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'No se pudo guardar la localidad')
      }

      resetLocalityForm()
      await loadLocalities(selectedEventForLocalities.id)
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDeleteLocality(id) {
    if (!window.confirm('¿Eliminar esta localidad?')) return
    try {
      const res = await fetch(`${API_BASE}/localidades/${id}`, {
        method: 'DELETE',
        headers: authHeaders(false),
      })
      if (!res.ok) throw new Error('No se pudo eliminar la localidad')
      await loadLocalities(selectedEventForLocalities.id)
    } catch (err) {
      alert(err.message)
    }
  }

  // ===================== CATEGORÍAS (CRUD) =====================

  async function handleCreateCategoria(e) {
    e.preventDefault()
    if (!categoriaNombre.trim()) return
    try {
      const res = await fetch(`${API_BASE}/categorias`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nombre: categoriaNombre.trim() }),
      })
      if (!res.ok) throw new Error('No se pudo crear la categoría')
      setCategoriaNombre('')
      await loadCategorias()
    } catch (err) {
      alert(err.message)
    }
  }

  function startEditCategoria(cat) {
    setEditingCategoriaId(cat.id)
    setEditingCategoriaNombre(cat.nombre)
  }

  function cancelEditCategoria() {
    setEditingCategoriaId(null)
    setEditingCategoriaNombre('')
  }

  async function handleUpdateCategoria(e) {
    e.preventDefault()
    if (!editingCategoriaId || !editingCategoriaNombre.trim()) return
    try {
      const res = await fetch(`${API_BASE}/categorias/${editingCategoriaId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ nombre: editingCategoriaNombre.trim() }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar la categoría')
      cancelEditCategoria()
      await loadCategorias()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDeleteCategoria(id) {
    if (!window.confirm('¿Eliminar esta categoría?')) return
    try {
      const res = await fetch(`${API_BASE}/categorias/${id}`, {
        method: 'DELETE',
        headers: authHeaders(false),
      })
      if (!res.ok) throw new Error('No se pudo eliminar la categoría')
      await loadCategorias()
    } catch (err) {
      alert(err.message)
    }
  }

  // ===================== USUARIOS (roles) =====================

  async function handleChangeUserRole(userId, newRolId) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ rol_id: Number(newRolId) }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar el rol')
      await loadUsers()
      await loadStats()
    } catch (err) {
      alert(err.message)
    }
  }

  // ===================== UI HELPERS =====================

  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm rounded-full border transition ${
        activeTab === id
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )

  // ===================== RENDER =====================

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        Panel Administrativo
      </h1>

      {/* tarjetas resumen */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card flex flex-col gap-1">
          <span className="text-xs text-slate-500">Eventos</span>
          <span className="text-3xl font-semibold text-primary">
            {stats.eventos}
          </span>
        </div>
        <div className="card flex flex-col gap-1">
          <span className="text-xs text-slate-500">Usuarios</span>
          <span className="text-3xl font-semibold text-slate-900">
            {stats.usuarios}
          </span>
        </div>
        <div className="card flex flex-col gap-1">
          <span className="text-xs text-slate-500">Ventas</span>
          <span className="text-3xl font-semibold text-emerald-600">
            Q {Number(stats.ventas || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* tabs */}
      <div className="flex flex-wrap gap-2">
        {tabBtn('eventos', 'Eventos')}
        {tabBtn('categorias', 'Categorías')}
        {tabBtn('usuarios', 'Usuarios')}
      </div>

      {/* CONTENIDO TAB */}
      <div className="card space-y-6">
        {/* ---------- TAB EVENTOS ---------- */}
        {activeTab === 'eventos' && (
          <>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Gestión de eventos
              </h2>
              <span className="text-xs text-slate-500">
                Lista, edita, elimina, configura precios, localidades e imágenes
                por evento.
              </span>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* tabla de eventos */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Ubicación</th>
                    <th className="px-3 py-2 text-left">Capacidad</th>
                    <th className="px-3 py-2 text-left">Precio base</th>
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-3 py-4 text-center text-slate-400"
                      >
                        Aún no hay eventos registrados.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr key={ev.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{ev.nombre}</td>
                        <td className="px-3 py-2">
                          {ev.fecha} {ev.hora?.slice(0, 5)}
                        </td>
                        <td className="px-3 py-2">{ev.ubicacion}</td>
                        <td className="px-3 py-2">
                          {ev.capacidad_total}
                        </td>
                        <td className="px-3 py-2">
                          {ev.precio_base != null
                            ? `Q ${Number(ev.precio_base).toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {ev.categoria_nombre || ev.categoria_id}
                        </td>
                        <td className="px-3 py-2 text-right space-x-2">
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => startEditEvent(ev)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="text-xs text-sky-600 hover:underline"
                            onClick={() => handleSelectEventLocalities(ev)}
                          >
                            Localidades
                          </button>
                          <button
                            type="button"
                            className="text-xs text-sky-600 hover:underline"
                            onClick={() => handleSelectEventImages(ev)}
                          >
                            Imágenes
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-500 hover:underline"
                            onClick={() => handleDeleteEvent(ev.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* formulario crear/editar evento */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {editingEventId ? 'Editar evento' : 'Crear nuevo evento'}
                </h3>
                {editingEventId && (
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:underline"
                    onClick={resetEventForm}
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSaveEvent}
                className="grid md:grid-cols-2 gap-3"
              >
                <input
                  className="input"
                  placeholder="Nombre del evento"
                  value={eventForm.nombre}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, nombre: e.target.value })
                  }
                  required
                />
                <input
                  className="input"
                  type="date"
                  value={eventForm.fecha}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, fecha: e.target.value })
                  }
                  required
                />
                <input
                  className="input"
                  type="time"
                  value={eventForm.hora}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, hora: e.target.value })
                  }
                  required
                />
                <input
                  className="input"
                  placeholder="Ubicación (ej. Estadio Cementos Progreso)"
                  value={eventForm.ubicacion}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      ubicacion: e.target.value,
                    })
                  }
                  required
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Capacidad total"
                  value={eventForm.capacidad_total}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      capacidad_total: e.target.value,
                    })
                  }
                  required
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Boletos disponibles"
                  value={eventForm.boletos_disponibles}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      boletos_disponibles: e.target.value,
                    })
                  }
                  required
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio base (ej. 450)"
                  value={eventForm.precio_base}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      precio_base: e.target.value,
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Localidad principal (ej. General, VIP)"
                  value={eventForm.localidad_principal}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      localidad_principal: e.target.value,
                    })
                  }
                />
                <select
                  className="select"
                  value={eventForm.categoria_id}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      categoria_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                <textarea
                  className="input md:col-span-2"
                  placeholder="Descripción del evento"
                  value={eventForm.descripcion}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      descripcion: e.target.value,
                    })
                  }
                  rows={3}
                />
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary text-xs px-5"
                    disabled={loading}
                  >
                    {loading
                      ? 'Guardando…'
                      : editingEventId
                      ? 'Actualizar evento'
                      : 'Guardar evento'}
                  </button>
                </div>
              </form>
            </div>

            {/* gestión de localidades */}
            {selectedEventForLocalities && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Localidades y precios de: {selectedEventForLocalities.nombre}
                  </h3>
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:underline"
                    onClick={() => {
                      setSelectedEventForLocalities(null)
                      setLocalities([])
                      resetLocalityForm()
                    }}
                  >
                    Cerrar
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Nombre</th>
                        <th className="px-3 py-2 text-left">Precio</th>
                        <th className="px-3 py-2 text-left">Capacidad</th>
                        <th className="px-3 py-2 text-left">Boletos disp.</th>
                        <th className="px-3 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localities.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-3 py-4 text-center text-slate-400"
                          >
                            Aún no hay localidades para este evento.
                          </td>
                        </tr>
                      ) : (
                        localities.map((loc) => (
                          <tr
                            key={loc.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-3 py-2">{loc.nombre}</td>
                            <td className="px-3 py-2">
                              Q {Number(loc.precio).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">{loc.capacidad}</td>
                            <td className="px-3 py-2">
                              {loc.boletos_disponibles}
                            </td>
                            <td className="px-3 py-2 text-right space-x-2">
                              <button
                                type="button"
                                className="text-xs text-primary hover:underline"
                                onClick={() => startEditLocality(loc)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="text-xs text-red-500 hover:underline"
                                onClick={() => handleDeleteLocality(loc.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <form
                  onSubmit={handleSaveLocality}
                  className="grid md:grid-cols-4 gap-3 pt-3 border-t border-slate-100"
                >
                  <input
                    className="input"
                    placeholder="Nombre (General, VIP, Palco...)"
                    value={localityForm.nombre}
                    onChange={(e) =>
                      setLocalityForm({
                        ...localityForm,
                        nombre: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Precio (Q)"
                    value={localityForm.precio}
                    onChange={(e) =>
                      setLocalityForm({
                        ...localityForm,
                        precio: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="Capacidad"
                    value={localityForm.capacidad}
                    onChange={(e) =>
                      setLocalityForm({
                        ...localityForm,
                        capacidad: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="Boletos disponibles (opcional)"
                    value={localityForm.boletos_disponibles}
                    onChange={(e) =>
                      setLocalityForm({
                        ...localityForm,
                        boletos_disponibles: e.target.value,
                      })
                    }
                  />
                  <div className="md:col-span-4 flex justify-end gap-2">
                    {editingLocalityId && (
                      <button
                        type="button"
                        className="text-xs text-slate-500 hover:underline"
                        onClick={resetLocalityForm}
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="btn-primary text-xs px-5">
                      {editingLocalityId
                        ? 'Actualizar localidad'
                        : 'Guardar localidad'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* gestión de imágenes */}
            {selectedEventForImages && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Imágenes de: {selectedEventForImages.nombre}
                  </h3>
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:underline"
                    onClick={() => {
                      setSelectedEventForImages(null)
                      setEventImages([])
                    }}
                  >
                    Cerrar
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadImages}
                    className="text-xs"
                  />
                  {uploadingImages && (
                    <span className="text-xs text-slate-500">
                      Subiendo imágenes…
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {eventImages.length === 0 && (
                    <p className="text-xs text-slate-500">
                      Aún no hay imágenes para este evento.
                    </p>
                  )}
                  {eventImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <img
                        src={`${API_BASE}${img.url_imagen}`}
                        alt={img.nombre_archivo || ''}
                        className="w-full h-32 object-cover"
                      />
                      {img.es_principal && (
                        <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-emerald-500 text-white">
                          Principal
                        </span>
                      )}
                      <div className="flex justify-end gap-2 px-2 py-1 bg-white">
                        {!img.es_principal && (
                          <button
                            type="button"
                            className="text-[10px] text-primary hover:underline"
                            onClick={() => handleMakePrincipal(img.id)}
                          >
                            Hacer principal
                          </button>
                        )}
                        <button
                          type="button"
                          className="text-[10px] text-red-500 hover:underline"
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ---------- TAB CATEGORÍAS ---------- */}
        {activeTab === 'categorias' && (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              Categorías de eventos
            </h2>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-3 py-4 text-center text-slate-400"
                      >
                        Aún no hay categorías. Crea la primera abajo.
                      </td>
                    </tr>
                  ) : (
                    categorias.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{c.id}</td>
                        <td className="px-3 py-2">
                          {editingCategoriaId === c.id ? (
                            <input
                              className="input w-full"
                              value={editingCategoriaNombre}
                              onChange={(e) =>
                                setEditingCategoriaNombre(e.target.value)
                              }
                            />
                          ) : (
                            c.nombre
                          )}
                        </td>
                        <td className="px-3 py-2 text-right space-x-2">
                          {editingCategoriaId === c.id ? (
                            <>
                              <button
                                type="button"
                                className="text-xs text-primary hover:underline"
                                onClick={handleUpdateCategoria}
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                className="text-xs text-slate-500 hover:underline"
                                onClick={cancelEditCategoria}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="text-xs text-primary hover:underline"
                                onClick={() => startEditCategoria(c)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="text-xs text-red-500 hover:underline"
                                onClick={() => handleDeleteCategoria(c.id)}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {editingCategoriaId === null && (
              <form
                onSubmit={handleCreateCategoria}
                className="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-100"
              >
                <input
                  className="input flex-1 min-w-[200px]"
                  placeholder="Nombre de la categoría (ej. Conciertos)"
                  value={categoriaNombre}
                  onChange={(e) => setCategoriaNombre(e.target.value)}
                />
                <button type="submit" className="btn-primary text-xs">
                  Guardar categoría
                </button>
              </form>
            )}
          </>
        )}

        {/* ---------- TAB USUARIOS ---------- */}
        {activeTab === 'usuarios' && (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              Usuarios y roles
            </h2>
            <p className="text-sm text-slate-500 mb-2">
              Aquí puedes ver los usuarios registrados y cambiar su rol entre
              cliente, organizador y administrador.
            </p>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Rol</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-3 py-4 text-center text-slate-400"
                      >
                        Aún no hay usuarios (o el endpoint /admin/users no está
                        implementado).
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{u.id}</td>
                        <td className="px-3 py-2">{u.nombre}</td>
                        <td className="px-3 py-2">{u.email}</td>
                        <td className="px-3 py-2">
                          {u.rol_nombre || u.rol}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <select
                            className="select text-xs w-40 inline-block"
                            defaultValue={u.rol_id}
                            onChange={(e) =>
                              handleChangeUserRole(u.id, e.target.value)
                            }
                          >
                            <option value="">Cambiar rol…</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
