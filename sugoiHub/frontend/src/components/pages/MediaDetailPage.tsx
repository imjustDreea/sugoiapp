import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import WikiSection from '../allPages/WikiSection';

type MediaData = {
  mal_id?: number;
  id?: number;
  title?: string;
  title_english?: string;
  name?: string;
  images?: {
    jpg?: { large_image_url?: string; image_url?: string };
    webp?: { large_image_url?: string; image_url?: string };
  };
  image_url?: string;
  synopsis?: string;
  description?: string;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  score?: number;
  rating?: number;
  genres?: Array<{ name: string }>;
  artists?: Array<{ name: string }>;
  platforms?: Array<{ platform: { name: string } }>;
  developers?: Array<{ name: string }>;
  year?: string | number;
  aired?: { string?: string };
  published?: { string?: string };
  released?: string;
  status?: string;
};

type Comment = {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
};

type MediaDetailPageProps = {
  type: 'anime' | 'manga' | 'music' | 'games';
};

export default function MediaDetailPage({ type }: MediaDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const { showToast } = useToast();

  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ likes_count: 0, comments_count: 0, user_has_liked: false });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadMediaData();
    loadStats();
    loadComments();
  }, [id, type]);

  async function loadMediaData() {
    setLoading(true);
    try {
      let endpoint = '';
      if (type === 'anime') endpoint = `/api/anime/${id}`;
      else if (type === 'manga') endpoint = `/api/manga/${id}`;
      else if (type === 'music') endpoint = `/api/music/${id}`;
      else if (type === 'games') endpoint = `/api/games/${id}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.ok) {
        const mediaContent = data.data || data.album || data.game;
        setMediaData(mediaContent);
      }
    } catch (e) {
      console.error('Error loading media:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const userId = auth?.user?.id || '';
      const res = await fetch(`/api/media/${type}/${id}?user_id=${userId}`);
      const data = await res.json();
      if (data.ok) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Error loading stats:', e);
    }
  }

  async function loadComments() {
    try {
      const res = await fetch(`/api/media/${type}/${id}/comments`);
      const data = await res.json();
      if (data.ok) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error('Error loading comments:', e);
    }
  }

  async function toggleLike() {
    if (!token) {
      showToast('Debes iniciar sesión', 'error');
      return;
    }

    const method = stats.user_has_liked ? 'DELETE' : 'POST';
    try {
      const res = await fetch(`/api/media/${type}/${id}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setStats(prev => ({
          ...prev,
          user_has_liked: !prev.user_has_liked,
          likes_count: prev.user_has_liked ? prev.likes_count - 1 : prev.likes_count + 1
        }));
      }
    } catch (e) {
      showToast('Error', 'error');
    }
  }

  async function addComment() {
    if (!token) {
      showToast('Debes iniciar sesión', 'error');
      return;
    }
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/media/${type}/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      const data = await res.json();
      if (data.ok) {
        setComments(prev => [data.comment, ...prev]);
        setStats(prev => ({ ...prev, comments_count: prev.comments_count + 1 }));
        setNewComment('');
        showToast('Comentario añadido', 'success');
      }
    } catch (e) {
      showToast('Error', 'error');
    } finally {
      setPosting(false);
    }
  }

  function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

  if (loading) {
    return (
      <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center text-muted">Cargando...</div>
      </section>
    );
  }

  if (!mediaData) {
    return (
      <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center text-muted">No se encontró el contenido</div>
      </section>
    );
  }

  const title = mediaData.title || mediaData.title_english || mediaData.name || 'Sin título';
  const imageUrl = 
    mediaData.images?.jpg?.large_image_url || 
    mediaData.images?.jpg?.image_url ||
    mediaData.images?.webp?.large_image_url ||
    mediaData.image_url ||
    '/placeholder.png';
  const description = mediaData.synopsis || mediaData.description || 'Sin descripción disponible';

  // Construir items para WikiSection según el tipo de media
  const getWikiItems = () => {
    const items = [];

    // Puntuación
    if (mediaData.score) {
      items.push({ label: 'Puntuación MAL', value: `⭐ ${mediaData.score}/10`, highlight: true });
    }
    if (mediaData.rating && !mediaData.score) {
      items.push({ label: 'Valoración', value: `⭐ ${mediaData.rating}/5`, highlight: true });
    }

    // Específico de anime
    if (type === 'anime') {
      if (mediaData.episodes) {
        items.push({ label: 'Episodios', value: mediaData.episodes });
      }
      if (mediaData.aired?.string) {
        items.push({ label: 'Emisión', value: mediaData.aired.string });
      }
      if (mediaData.status) {
        items.push({ label: 'Estado', value: mediaData.status });
      }
      if (mediaData.genres && mediaData.genres.length > 0) {
        const genreText = Array.isArray(mediaData.genres) 
          ? mediaData.genres.map(g => typeof g === 'string' ? g : g.name).join(', ')
          : String(mediaData.genres);
        items.push({ 
          label: 'Géneros', 
          value: genreText
        });
      }
    }

    // Específico de manga
    if (type === 'manga') {
      if (mediaData.chapters) {
        items.push({ label: 'Capítulos', value: mediaData.chapters });
      }
      if (mediaData.volumes) {
        items.push({ label: 'Volúmenes', value: mediaData.volumes });
      }
      if (mediaData.published?.string) {
        items.push({ label: 'Publicación', value: mediaData.published.string });
      }
      if (mediaData.status) {
        items.push({ label: 'Estado', value: mediaData.status });
      }
      if (mediaData.genres && mediaData.genres.length > 0) {
        const genreText = Array.isArray(mediaData.genres) 
          ? mediaData.genres.map(g => typeof g === 'string' ? g : g.name).join(', ')
          : String(mediaData.genres);
        items.push({ 
          label: 'Géneros', 
          value: genreText
        });
      }
    }

    // Específico de música
    if (type === 'music') {
      if (mediaData.artists && mediaData.artists.length > 0) {
        items.push({ label: 'Artista', value: mediaData.artists[0].name });
      }
      if ((mediaData as any).album) {
        items.push({ label: 'Álbum', value: (mediaData as any).album });
      }
      if ((mediaData as any).duration) {
        const mins = Math.floor((mediaData as any).duration / 60);
        const secs = (mediaData as any).duration % 60;
        items.push({ label: 'Duración', value: `${mins}:${secs.toString().padStart(2, '0')}` });
      }
      if (mediaData.year) {
        items.push({ label: 'Año', value: mediaData.year });
      }
      if (mediaData.genres && mediaData.genres.length > 0) {
        const genreText = Array.isArray(mediaData.genres) 
          ? mediaData.genres.map(g => typeof g === 'string' ? g : g.name).join(', ')
          : String(mediaData.genres);
        items.push({ 
          label: 'Géneros', 
          value: genreText
        });
      }
    }

    // Específico de juegos
    if (type === 'games') {
      if (mediaData.developers && mediaData.developers.length > 0) {
        items.push({ label: 'Desarrollador', value: mediaData.developers[0].name });
      }
      if (mediaData.released) {
        items.push({ label: 'Lanzamiento', value: mediaData.released });
      }
      if (mediaData.platforms && mediaData.platforms.length > 0) {
        const platformNames = mediaData.platforms.slice(0, 5).map(p => p.platform.name).join(', ');
        items.push({ 
          label: 'Plataformas', 
          value: platformNames + (mediaData.platforms.length > 5 ? '...' : '')
        });
      }
      if (mediaData.genres && mediaData.genres.length > 0) {
        const genreText = Array.isArray(mediaData.genres) 
          ? mediaData.genres.map(g => typeof g === 'string' ? g : g.name).join(', ')
          : String(mediaData.genres);
        items.push({ 
          label: 'Géneros', 
          value: genreText
        });
      }
    }

    return items;
  };

  const wikiItems = getWikiItems();

  return (
    <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-5xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm">
        <Link to={`/${type}`} className="text-accentLime hover:underline">
          ← Volver a {type === 'anime' ? 'Anime' : type === 'manga' ? 'Manga' : type === 'music' ? 'Música' : 'Juegos'}
        </Link>
      </div>

      {/* Contenido principal */}
      <div className="bg-panel border border-grid rounded-xl overflow-hidden">
        <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
          {/* Imagen */}
          <div>
            <img
              src={imageUrl}
              alt={title}
              className="w-full rounded-lg object-cover"
              style={{ maxHeight: '450px' }}
            />
          </div>

          {/* Información */}
          <div>
            <h1 className="text-3xl font-bold mb-4 text-white">{title}</h1>
            
            {/* Descripción */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Descripción</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
            </div>

            {/* Likes y comentarios */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  stats.user_has_liked
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-panel border border-grid text-gray-400 hover:text-red-400'
                }`}
              >
                <span>{stats.user_has_liked ? '❤️' : '🤍'}</span>
                <span>{stats.likes_count}</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-panel border border-grid text-gray-400">
                <span>💬</span>
                <span>{stats.comments_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WikiSection - Ancho completo debajo del contenido */}
        <div className="border-t border-grid p-6">
          <WikiSection items={wikiItems} />
        </div>

        {/* Sección de comentarios */}
        <div className="border-t border-grid p-6">
          <h2 className="text-xl font-semibold mb-4">Comentarios</h2>

          {/* Nuevo comentario */}
          {token && (
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addComment()}
                className="flex-1 h-10 px-4 rounded-lg bg-dark border border-grid text-white placeholder-gray-500 focus:outline-none focus:border-accentLime transition"
              />
              <button
                onClick={addComment}
                disabled={posting || !newComment.trim()}
                className="pixel-btn pixel-btn-primary pixel-btn-sm"
              >
                {posting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          )}

          {/* Lista de comentarios */}
          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="text-center text-muted">No hay comentarios aún. ¡Sé el primero!</p>
            )}
            {comments.map(comment => {
              const displayName = comment.name || comment.username;
              const initials = (comment.username || 'U').trim().slice(0, 2).toUpperCase();

              return (
                <div key={comment.id} className="flex gap-3 p-3 bg-dark border border-grid rounded-lg">
                  <Link to={`/u/${comment.username}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-black border-2 border-grid flex items-center justify-center overflow-hidden">
                      {comment.avatar_url ? (
                        <img src={comment.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="pixel-font text-xs text-accentLime">{initials}</span>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <Link to={`/u/${comment.username}`} className="font-semibold text-white hover:text-accentLime transition">
                        {displayName}
                      </Link>
                      <span className="text-xs text-muted">@{comment.username} · {formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
