import { useState } from "react";
import MangaCard from "../manga/MangaCard";

type Manga = {
  id: string;
  title: string;
  author?: string;
  chapters?: number;
  status?: "Ongoing" | "Completed" | string;
  rating?: number;
  genres?: string[];
};

export default function MangaPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);

  // Removed remote API fetch. Use local state or props to populate mangas.
  // If you want placeholder data, set it here or pass via props.

  function handleAdd(m: Manga) {
    console.log('Add manga', m.id, m.title);
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Manga</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado desde la base de datos.</p>
        </div>
        <div className="inline-flex items-center gap-3">
          <span className="px-3 py-1 rounded-full tag-popular text-sm">Popular</span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
        {mangas.map((m) => (
          <div className="h-full" key={m.id}>
            <MangaCard manga={m as any} onAdd={handleAdd} />
          </div>
        ))}
      </div>
    </section>
  );
}

