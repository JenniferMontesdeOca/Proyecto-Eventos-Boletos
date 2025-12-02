// frontend/src/components/EventCard.jsx
import { BASE } from '../api';

function buildImageUrl(path) {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${BASE}${path}`;
  }
  return `${BASE}/${path}`;
}

export default function EventCard({ ev, onClick }) {
  const imgPath =
    ev.imagenes?.find((i) => i.es_principal)?.url_imagen ||
    ev.imagenes?.[0]?.url_imagen;

  const img = buildImageUrl(imgPath);

  return (
    <article
      className="bg-white rounded-3xl shadow-soft p-4 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      {img && (
        <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 mb-2">
          <img
            src={img}
            alt={ev.nombre}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="text-xs text-slate-500">
        {ev.fecha && ev.hora && (
          <p>
            {new Date(ev.fecha).toLocaleDateString()} · {ev.hora.slice(0, 5)}
          </p>
        )}
      </div>

      <h3 className="text-sm font-semibold text-slate-900">
        {ev.nombre}
      </h3>

      <p className="text-xs text-slate-500">
        Evento especial en Guatemala.
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-slate-100 text-[11px] px-3 py-1 text-slate-600">
          {ev.categoria_nombre || 'Evento'}
        </span>
        <button className="text-xs font-semibold px-4 py-1.5 rounded-full bg-primary text-white shadow-sm hover:brightness-110">
          Comprar entradas
        </button>
      </div>
    </article>
  );
}
