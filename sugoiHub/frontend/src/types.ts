export type Game = {
  id: string | number;
  title: string;
  studio?: string;
  platforms?: string[];
  genre?: string;
  rating?: number;
};

export type Manga = {
  id: string | number;
  title: string;
  author?: string;
  chapters?: number;
  status?: "Ongoing" | "Completed" | string;
  rating?: number;
  genres?: string[];
};
