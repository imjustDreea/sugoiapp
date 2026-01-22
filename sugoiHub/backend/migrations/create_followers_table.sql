-- Tabla de followers (seguidores)
CREATE TABLE IF NOT EXISTS public.followers (
  follower_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  followed_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_followed ON public.followers(followed_id);
