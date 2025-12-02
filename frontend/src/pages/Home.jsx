import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Api } from '../api'
import Filters from '../components/Filters'
import Pagination from '../components/Pagination'
import EventCard from '../components/EventCard'

export default function Home() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 12 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  async function load(p = 1) {
    try {
      setLoading(true)
      setError('')
      const qs = new URLSearchParams(query.replace('?', ''))
      qs.set('page', p)
      qs.set('limit', data.limit)
      const res = await Api.listEvents('?' + qs.toString())
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const destacados = data.items.slice(0, 3)

  return (
    <div className="container py-8 space-y-8">
      {/* HERO estilo Ticketasa */}
      <section className="bg-gradient-to-r from-primary to-primaryLight text-white rounded-3xl shadow-soft px-6 sm:px-10 py-10 flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <p className="uppercase text-[11px] tracking-[0.25em] text-white/80">
            Plataforma de boletos
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Tus conciertos y eventos favoritos, en un solo lugar.
          </h1>
          <p className="text-sm text-white/80 max-w-xl">
            Compra tus entradas para shows, festivales, conferencias y más.
            Filtra por fecha, categoría y ubicación, igual que en Ticketasa.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="btn-outline text-xs"
              onClick={() =>
                document
                  .getElementById('eventos-lista')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Ver eventos disponibles
            </button>
          </div>
        </div>

        {/* highlight del primer evento si existe */}
        {destacados[0] && (
          <div className="flex-1 max-w-md w-full">
            <div className="bg-white/10 rounded-2xl p-3 ring-1 ring-white/20 backdrop-blur">
              <p className="text-xs text-white/70 mb-1">Evento destacado</p>
              <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-soft">
                <EventCard
                  ev={destacados[0]}
                  onClick={() => navigate(`/evento/${destacados[0].id}`)}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* filtros tipo “buscador” */}
      <section className="bg-white rounded-2xl shadow-soft p-4 -mt-6 relative z-10">
        <p className="text-sm font-semibold mb-3 text-slate-800">
          Busca y filtra tus eventos
        </p>
        <Filters onApply={setQuery} />
      </section>

      {/* listado de eventos */}
      <section id="eventos-lista" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Próximos eventos
          </h2>
          {data.total > 0 && (
            <p className="text-xs text-slate-500">
              Mostrando {data.items.length} de {data.total} eventos
            </p>
          )}
        </div>

        {loading && <p className="mt-4 text-sm">Cargando eventos…</p>}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {data.items.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Aún no hay eventos cargados. Crea algunos desde el panel de
                organizador/administrador.
              </p>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                  {data.items.map((ev) => (
                    <EventCard
                      key={ev.id}
                      ev={ev}
                      onClick={() => navigate(`/evento/${ev.id}`)}
                    />
                  ))}
                </div>
                <Pagination
                  page={data.page}
                  limit={data.limit}
                  total={data.total}
                  onChange={load}
                />
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
