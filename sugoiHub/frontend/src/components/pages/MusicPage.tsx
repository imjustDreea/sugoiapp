export default function MusicPage(){
  const albums = Array.from({length:6}).map((_,i)=>({id:i+1,title:`Album ${i+1}`,artist:`Artist ${i+1}`}))
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Music</h2>
        <p className="text-sm text-muted mt-1">Tus playlists y lanzamientos favoritos.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map(a => (
          <div key={a.id} className="bg-darkCard rounded-xl p-4 shadow-card h-full">
            <h3 className="text-lg text-white font-semibold">{a.title}</h3>
            <p className="text-sm text-muted mt-1">{a.artist}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
