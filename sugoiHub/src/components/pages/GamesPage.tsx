import GameCard from "../games/GameCard";

type Game = {
  id: number;
  title: string;
  studio: string;
  platforms: string[];
  genre: string;
  rating: number;
};

const sampleGames: Game[] = [
  { id: 1, title: "Elden Ring", studio: "FromSoftware", platforms: ["Multi-platform"], genre: "Action RPG", rating: 9.5 },
  { id: 2, title: "Final Fantasy XVI", studio: "Square Enix", platforms: ["PS5", "PC"], genre: "JRPG", rating: 9.2 },
  { id: 3, title: "Persona 5 Royal", studio: "Atlus", platforms: ["Multi-platform"], genre: "JRPG", rating: 9.7 },
  { id: 4, title: "Hollow Knight", studio: "Team Cherry", platforms: ["Multi-platform"], genre: "Metroidvania", rating: 9.3 },
  { id: 5, title: "God of War", studio: "Santa Monica", platforms: ["PS5"], genre: "Action", rating: 9.4 },
  { id: 6, title: "Hades", studio: "Supergiant", platforms: ["Multi-platform"], genre: "Roguelike", rating: 9.1 },
];

export default function GamesPage() {
  function handleAdd(g: Game) {
    console.log('Add game', g.id, g.title);
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Games</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado estático de juegos — puedes añadirlos a tu lista en el futuro.</p>
        </div>
        <div className="inline-flex items-center gap-3">
          <span className="px-3 py-1 rounded-full tag-popular text-sm">Popular</span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
        {sampleGames.map((g) => (
          <div className="h-full" key={g.id}>
            <GameCard game={g} onAdd={handleAdd} />
          </div>
        ))}
      </div>
    </section>
  );
}
