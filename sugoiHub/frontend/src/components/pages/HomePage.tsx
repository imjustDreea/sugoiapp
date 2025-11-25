import TestConn from '../TestConn';

export default function HomePage() {
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Home</h2>
        <p className="text-sm text-muted mt-1">Bienvenido a SugoiHub — tu tablero personal con recomendaciones y atajos.</p>
      </div>

      <TestConn />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-darkCard rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-white">Your Feed</h3>
          <p className="text-sm text-muted mt-2">Aquí aparecerán actualizaciones de tus autores y juegos favoritos.</p>
        </div>

        <div className="bg-darkCard rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-white">Recommendations</h3>
          <p className="text-sm text-muted mt-2">Basado en tus lecturas y partidas.</p>
        </div>
      </div>
    </section>
  );
}
