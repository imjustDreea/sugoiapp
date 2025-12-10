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

export type Music = {
  id: string | number;
  title: string;
  artist?: string;
  tracks?: number;
  year?: number;
  rating?: number;
  genres?: string[];
};
