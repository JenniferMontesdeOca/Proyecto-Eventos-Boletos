export default function Contact() {
  return (
    <div className="container py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        ¡Hablemos!
      </h1>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] items-start">
        {/* MAPA */}
        <div className="w-full">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <iframe
              title="Ubicación oficina Eventos Tickets Guatemala"
              src="https://www.google.com/maps?q=15+Avenida+17-40+Zona+13+Guatemala&output=embed"
              className="w-full h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* HORARIO Y CONTACTO */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Horario
            </h2>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>
                <span className="font-semibold">LUN</span> <span>9am – 5pm</span>
              </li>
              <li>
                <span className="font-semibold">MAR</span> <span>9am – 5pm</span>
              </li>
              <li>
                <span className="font-semibold">MIE</span> <span>9am – 5pm</span>
              </li>
              <li>
                <span className="font-semibold">JUE</span> <span>9am – 5pm</span>
              </li>
              <li>
                <span className="font-semibold">VIE</span> <span>9am – 5pm</span>
              </li>
              <li className="mt-2">
                <span className="font-semibold">SAB y DOM</span>{' '}
                <span>Cerrado</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Para soporte
            </h2>
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <span className="font-semibold">Correo:</span>
                <br />
                servicio@tueventos.com
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span>
                <br />
                0000-0000
              </p>
              <p>
                <span className="font-semibold">WhatsApp:</span>
                <br />
                0000-0000
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Dirección
            </h2>
            <p className="text-sm text-slate-700">
              15 avenida 17-40 zona 13
              <br />
              Edificio Torre Mundial 1
              <br />
              Nivel 6, Oficina 602
              <br />
              Ciudad de Guatemala
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
