import MangaCard from "../manga/MangaCard";

type Manga = {
  id: number;
  title: string;
  author: string;
  chapters: number;
  status: "Ongoing" | "Completed" | string;
  rating: number;
  genres: string[];
};

const sampleMangas: Manga[] = [
  { id: 1, title: "One Piece", author: "Eiichiro Oda", chapters: 1095, status: "Ongoing", rating: 9.3, genres: ["Adventure", "Fantasy"] },
  { id: 2, title: "Jujutsu Kaisen", author: "Gege Akutami", chapters: 245, status: "Ongoing", rating: 9.1, genres: ["Action", "Supernatural"] },
  { id: 3, title: "Chainsaw Man", author: "Tatsuki Fujimoto", chapters: 155, status: "Ongoing", rating: 9.2, genres: ["Action", "Horror"] },
  { id: 4, title: "My Hero Academia", author: "Kohei Horikoshi", chapters: 405, status: "Ongoing", rating: 8.9, genres: ["Action", "School"] },
  { id: 5, title: "Demon Slayer", author: "Koyoharu Gotouge", chapters: 205, status: "Completed", rating: 9.0, genres: ["Action", "Historical"] },
  { id: 6, title: "Attack on Titan", author: "Hajime Isayama", chapters: 139, status: "Completed", rating: 9.4, genres: ["Action", "Drama"] },
];

export default function MangaPage() {
  function handleAdd(m: Manga) {
    // placeholder: later connect to backend / user list
    console.log('Add manga', m.id, m.title);
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Manga</h2>
          <p className="text-sm text-muted-foreground mt-1">Listado estático de mangas — puedes añadirlos a tu lista en el futuro.</p>
        </div>
        <div className="inline-flex items-center gap-3">
          <span className="px-3 py-1 rounded-full tag-popular text-sm">Popular</span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch" style={{ gridAutoRows: '1fr' }}>
        {sampleMangas.map((m) => (
          <div className="h-full" key={m.id}>
            <MangaCard manga={m} onAdd={handleAdd} />
          </div>
        ))}
      </div>
    </section>
  );
}

