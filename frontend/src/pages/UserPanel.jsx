// frontend/src/pages/UserPanel.jsx
import { useEffect, useState } from 'react'
import { Api } from '../api'

export default function UserPanel() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')
        const data = await Api.myTickets()
        setTickets(data || [])
      } catch (e) {
        setError(e.message || 'Error al cargar tus boletos')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        Mis boletos
      </h1>

      {loading && (
        <p className="text-sm text-slate-500">Cargando boletos…</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && tickets.length === 0 && (
        <p className="text-sm text-slate-500">
          Aún no has comprado boletos.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((t) => {
          const fechaEvento = t.evento_fecha
            ? new Date(t.evento_fecha).toLocaleDateString()
            : ''
          const horaEvento = t.evento_hora
            ? t.evento_hora.slice(0, 5)
            : ''
          const fechaCompra = t.fecha_compra
            ? new Date(t.fecha_compra).toLocaleString()
            : ''
          const precioUnit = Number(t.precio || 0)
          const cantidad = 1 // 1 fila = 1 boleto en tu modelo actual
          const total = precioUnit * cantidad

          return (
            <article
              key={t.id}
              className="bg-white rounded-3xl shadow-soft px-4 py-3 flex flex-col gap-2"
            >
              {/* Evento */}
              <h2 className="text-sm font-semibold text-slate-900">
                {t.evento_nombre}
              </h2>

              <p className="text-xs text-slate-500">
                {fechaEvento} • {horaEvento}
              </p>
              <p className="text-xs text-slate-500">{t.ubicacion}</p>

              {/* Localidad */}
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Localidad:</span>{' '}
                {t.localidad_nombre || 'Sin localidad'}
              </p>

              {/* Info económica */}
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Cantidad:</span>{' '}
                {cantidad} boleto
              </p>

              <p className="text-xs text-slate-600">
                <span className="font-semibold">Precio unitario:</span>{' '}
                Q {precioUnit.toFixed(2)}
              </p>

              <p className="text-xs text-slate-600">
                <span className="font-semibold">Total:</span>{' '}
                Q {total.toFixed(2)}
              </p>

              <p className="text-xs text-slate-600">
                <span className="font-semibold">Fecha de compra:</span>{' '}
                {fechaCompra}
              </p>

              <p className="text-xs mt-1">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                  Estado: {t.estado}
                </span>
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
