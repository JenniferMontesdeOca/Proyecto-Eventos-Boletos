// frontend/src/pages/EventDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Api, BASE, getToken } from '../api'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ev, setEv] = useState(null)
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState('')
  const [localidadId, setLocalidadId] = useState('')

  useEffect(() => {
    Api.getEvent(id)
      .then((data) => {
        setEv(data)
        // si trae localidades, dejamos la primera seleccionada por defecto
        if (data.localidades && data.localidades.length > 0) {
          setLocalidadId(String(data.localidades[0].id))
        }
      })
      .catch((e) => setMsg(e.message))
  }, [id])

  async function buy() {
    if (!getToken()) {
      navigate('/login')
      return
    }

    try {
      await Api.buy(
        Number(id),
        Number(qty),
        localidadId ? Number(localidadId) : undefined
      )
      setMsg('¡Compra realizada! Revisa tus boletos en tu panel.')
    } catch (e) {
      console.error(e)
      setMsg(e.message || 'No se pudo completar la compra')
    }
  }

  if (!ev)
    return (
      <div className="container py-8">
        Cargando… {msg && <span className="text-red-500">{msg}</span>}
      </div>
    )

  const principal =
    ev.imagenes?.find((i) => i.es_principal) || ev.imagenes?.[0]

  const principalUrl = principal?.url_imagen
    ? `${BASE}${principal.url_imagen}`
    : null

  return (
    <div className="container py-8 grid lg:grid-cols-2 gap-8">
      <div className="space-y-3">
        {principalUrl && (
          <img
            src={principalUrl}
            className="w-full rounded-2xl object-cover max-h-[420px]"
          />
        )}

        <div className="flex gap-2 overflow-x-auto">
          {ev.imagenes?.map((img) => {
            const thumb = img.url_imagen ? `${BASE}${img.url_imagen}` : ''
            return (
              <img
                key={img.id}
                src={thumb}
                className="h-20 w-28 object-cover rounded-xl border"
              />
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">{ev.nombre}</h1>
        <p className="text-slate-600">{ev.descripcion}</p>

        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="badge">
            {new Date(ev.fecha).toLocaleDateString()} • {ev.hora}
          </span>
          <span className="badge">{ev.ubicacion}</span>
          <span className="badge">Capacidad: {ev.capacidad_total}</span>
          <span className="badge">Disponibles: {ev.boletos_disponibles}</span>
        </div>

        {/* 👇 Selector de localidad */}
        {ev.localidades && ev.localidades.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Selecciona localidad
            </label>
            <select
              className="input w-full"
              value={localidadId}
              onChange={(e) => setLocalidadId(e.target.value)}
            >
              {ev.localidades.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nombre} — Q {Number(loc.precio).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="input w-24"
          />
          <button className="btn-primary" onClick={buy}>
            Comprar boleto
          </button>
        </div>

        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </div>
    </div>
  )
}
