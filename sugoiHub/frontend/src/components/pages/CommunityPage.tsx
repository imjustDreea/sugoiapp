export default function CommunityPage(){
  const posts = [
    {id:1,author:'UserA',text:'¿Alguien jugando Elden Ring?'},
    {id:2,author:'UserB',text:'Recomiendo este manga...'},
    {id:3,author:'UserC',text:'Concierto la semana que viene'}
  ];
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Community</h2>
        <p className="text-sm text-muted mt-1">Conversa con otros miembros.</p>
      </div>

      <div className="space-y-4">
        {posts.map(p=> (
          <div key={p.id} className="bg-darkCard p-4 rounded-lg shadow-card">
            <div className="text-sm text-muted">{p.author}</div>
            <div className="mt-2 text-white">{p.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
