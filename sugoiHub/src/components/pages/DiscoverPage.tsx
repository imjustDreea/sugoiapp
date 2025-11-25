export default function DiscoverPage() {
  const sample = Array.from({length:6}).map((_,i)=>({id:i+1,title:`Hot Pick ${i+1}`}));
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Discover</h2>
        <p className="text-sm text-muted mt-1">Explora recomendaciones, listas y tendencias.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sample.map(s=> (
          <div key={s.id} className="bg-darkCard rounded-xl p-4 shadow-card h-full">
            <h3 className="text-lg text-white font-semibold">{s.title}</h3>
            <p className="text-sm text-muted mt-2">Descripción breve del contenido.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
