import { useEffect, useState } from "react"
import { getToken } from "../api"   // 👈 solo importamos getToken

// 👇 definimos la URL base aquí
const API_BASE = "http://localhost:5000"

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [nombre, setNombre] = useState("")
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const token = getToken()

  function authHeaders(json = true) {
    const h = {}
    if (json) h["Content-Type"] = "application/json"
    if (token) h["Authorization"] = `Bearer ${token}`
    return h
  }

  const cargarCategorias = async () => {
    try {
      setError("")
      const res = await fetch(`${API_BASE}/categorias`)
      if (!res.ok) throw new Error("Error al cargar categorías")
      const data = await res.json()
      setCategorias(data || [])
    } catch (error) {
      console.error("Error cargando categorías:", error)
      setError(error.message)
    }
  }

  const guardarCategoria = async () => {
    if (!nombre.trim()) return alert("Escribe un nombre")

    try {
      setLoading(true)
      setError("")

      const method = editId ? "PUT" : "POST"
      const url = editId
        ? `${API_BASE}/categorias/${editId}`
        : `${API_BASE}/categorias`

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ nombre: nombre.trim() }),
      })

      if (!res.ok) throw new Error("Error guardando categoría")

      setNombre("")
      setEditId(null)
      await cargarCategorias()
    } catch (error) {
      console.error(error)
      alert(error.message || "Error guardando categoría")
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar categoría?")) return

    try {
      const res = await fetch(`${API_BASE}/categorias/${id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      })
      if (!res.ok) throw new Error("Error eliminando categoría")
      await cargarCategorias()
    } catch (error) {
      console.error(error)
      alert(error.message || "Error eliminando categoría")
    }
  }

  const editar = (cat) => {
    setEditId(cat.id)
    setNombre(cat.nombre)
  }

  useEffect(() => {
    cargarCategorias()
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Gestión de Categorías</h1>

      {error && (
        <p className="mb-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* FORMULARIO */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          className="input w-80"
          placeholder="Nombre de categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={guardarCategoria}
          disabled={loading}
        >
          {loading
            ? "Guardando..."
            : editId
            ? "Actualizar"
            : "Crear"}
        </button>
        {editId && (
          <button
            type="button"
            className="text-sm text-slate-500 hover:underline"
            onClick={() => {
              setEditId(null)
              setNombre("")
            }}
          >
            Cancelar edición
          </button>
        )}
      </div>

      {/* TABLA */}
      <div className="card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id} className="border-t border-slate-100">
                <td className="p-3">{cat.id}</td>
                <td className="p-3">
                  {editId === cat.id ? (
                    <input
                      className="input w-full"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  ) : (
                    cat.nombre
                  )}
                </td>
                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => editar(cat)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminar(cat.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {categorias.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-400">
                  No hay categorías registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
