export default function FAQ() {
  const faqs = [
    {
      q: "¿Qué es Eventos Tickets Guatemala?",
      a: "Eventos Tickets Guatemala es la nueva plataforma de venta de entradas a conciertos y eventos de ASA Promotions.",
    },
    {
      q: "¿En cuánto tiempo llegan las entradas de Mi Promo?",
      a: "Las entradas se enviarán a tu correo en un plazo de 2 a 3 semanas, luego de que recibamos la data de los clientes por parte de BAC.",
    },
    {
      q: "¿Número de teléfono o WhatsApp para dudas?",
      a: "Puedes comunicarte con nosotros al WhatsApp: 0000-0000.",
    },
    {
      q: "¿Tiempo de resolución de reembolso?",
      a: "Los reembolsos se procesan en un máximo de 4 días hábiles después de la compra.",
    },
    {
      q: "¿Cómo descargo mi entrada?",
      a: "Tu entrada llegará de forma inmediata al correo electrónico registrado al finalizar tu compra.",
    },
    {
      q: "¿Cómo descargo mi factura?",
      a: "La factura será enviada al correo electrónico que proporcionaste durante el proceso de compra.",
    },
    {
      q: "¿De qué correo recibiré mis entradas?",
      a: "Las entradas serán enviadas desde: tickets@eventix.nl.",
    },
    {
      q: "¿Cuántas entradas por usuario o tarjeta puedo comprar?",
      a: "Puedes comprar hasta 10 entradas por transacción.",
    },
    {
      q: "¿Dónde quedan los puntos físicos de Eventos Tickets Guatemala?",
      a: "Nuestras oficinas están en: 15 avenida 17-40 zona 13, Edificio Torre Mundial 1, Nivel 6, Oficina 602.",
    },
  ];

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
        Preguntas Frecuentes
      </h1>

      <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
        Si tienes dudas sobre nuestro servicio, aquí encontrarás las respuestas
        a las preguntas más comunes sobre el funcionamiento de nuestra
        plataforma.
      </p>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <details
            key={i}
            className="group border border-slate-200 rounded-2xl p-4 transition hover:shadow-sm"
          >
            <summary className="cursor-pointer flex justify-between items-center font-medium text-slate-900">
              {item.q}
              <span className="transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <p className="mt-2 text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-slate-500">
        ¿Aún tienes preguntas?  
        <br />
        Escríbenos a{" "}
        <span className="text-primary font-semibold">servicio@tueventos.com</span>{" "}
        o a nuestro WhatsApp{" "}
        <span className="font-semibold">0000-0000</span>.
      </div>
    </div>
  );
}
