import { useEffect, useState } from "react";
import GameCard from "../games/GameCard";

type Game = {
  id: string;
  title: string;
  studio?: string;
  platforms?: string[];
  genre?: string;
  rating?: number;
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/games')
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped = data.map((g) => ({
          id: g.id,
          title: g.title,
          studio: g.description ? String(g.description).split('.')[0] : 'Unknown Studio',
          platforms: [],
          genre: g.genre || '',
          rating: g.rating || 0,
        }));
        setGames(mapped);
      })
      .catch((err) => console.error('Failed to fetch games', err));
  }, []);

  function handleAdd(g: Game) {
    console.log('Add game', g.id, g.title);
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Games</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado desde la base de datos.</p>
        </div>
        <div className="inline-flex items-center gap-3">
          <span className="px-3 py-1 rounded-full tag-popular text-sm">Popular</span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
        {games.map((g) => (
          <div className="h-full" key={g.id}>
            <GameCard game={g as any} onAdd={handleAdd} />
          </div>
        ))}
      </div>
    </section>
  );
}
