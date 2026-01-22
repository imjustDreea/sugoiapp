import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type LikesState = {
  [key: string]: { liked: boolean; count: number };
};

type LikesContextType = {
  likes: LikesState;
  setLike: (type: string, id: string | number, liked: boolean, count: number) => void;
  getLike: (type: string, id: string | number) => { liked: boolean; count: number } | undefined;
};

export const LikesContext = createContext<LikesContextType | undefined>(undefined);

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likes, setLikes] = useState<LikesState>({});

  const setLike = useCallback((type: string, id: string | number, liked: boolean, count: number) => {
    const key = `${type}:${id}`;
    setLikes((prev) => ({
      ...prev,
      [key]: { liked, count },
    }));
  }, []);

  const getLike = useCallback((type: string, id: string | number) => {
    const key = `${type}:${id}`;
    return likes[key];
  }, [likes]);

  return (
    <LikesContext.Provider value={{ likes, setLike, getLike }}>
      {children}
    </LikesContext.Provider>
  );
}
