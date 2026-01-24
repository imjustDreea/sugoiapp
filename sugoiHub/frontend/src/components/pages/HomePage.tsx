import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getApiBase } from '../../lib/apiBase';

type Post = {
  id: number;
  user_id: number;
  username: string;
  name: string;
  avatar_url: string | null;
  content: string;
  image_url: string | null;
  favorite_type?: string;
  favorite_id?: string;
  favorite_title?: string;
  favorite_image?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
};

type Recommendation = {
  id: string;
  title: string;
  image_url: string | null;
  type: 'anime' | 'manga' | 'music';
  meta: any;
};

export default function HomePage() {
  const authContext = useContext(AuthContext);
  const token = authContext?.token;
  const [feed, setFeed] = useState<Post[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [recsError, setRecsError] = useState('');

  // Cargar feed
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const fetchFeed = async () => {
      setFeedLoading(true);
      setFeedError('');
      try {
        const apiBase = getApiBase();
        const endpoint = apiBase ? `${apiBase}/api/posts/feed` : `/api/posts/feed`;
        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || 'No se pudo cargar el feed');
        }
        setFeed(Array.isArray(data.posts) ? data.posts : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setFeedError(err instanceof Error ? err.message : 'Error cargando feed');
      } finally {
        setFeedLoading(false);
      }
    };

    fetchFeed();
    return () => controller.abort();
  }, [token]);

  // Cargar recomendaciones
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const fetchRecommendations = async () => {
      setRecsLoading(true);
      setRecsError('');
      try {
        const apiBase = getApiBase();
        const endpoint = apiBase ? `${apiBase}/api/recommendations` : `/api/recommendations`;
        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || 'No se pudieron cargar las recomendaciones');
        }
        setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setRecsError(err instanceof Error ? err.message : 'Error cargando recomendaciones');
      } finally {
        setRecsLoading(false);
      }
    };

    fetchRecommendations();
    return () => controller.abort();
  }, [token]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: dateStr.includes(new Date().getFullYear().toString()) ? undefined : 'numeric',
    });
  };

  return (
    <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="page-title text-2xl md:text-2.5xl">INICIO</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed Section - 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-darkCard rounded-xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-white mb-4">Tu Feed</h3>

            {feedError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                {feedError}
              </div>
            )}

            {feedLoading && (
              <div className="flex justify-center py-8">
                <span className="text-sm text-muted">Cargando posts...</span>
              </div>
            )}

            {!feedLoading && feed.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted text-sm">No hay posts del feed aún. ¡Sigue a más usuarios!</p>
              </div>
            )}

            <div className="space-y-4">
              {feed.map((post) => (
                <div key={post.id} className="border border-gray-800 rounded-lg p-4 hover:bg-darkCard/50 transition">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    {post.avatar_url && (
                      <img src={post.avatar_url} alt={post.username} className="w-10 h-10 rounded-full" />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {post.name || post.username}
                      </p>
                      <p className="text-xs text-muted">@{post.username}</p>
                    </div>
                    <p className="text-xs text-muted">{formatDate(post.created_at)}</p>
                  </div>

                  {/* Content */}
                  {post.content && (
                    <p className="text-white text-sm mb-3 whitespace-pre-wrap break-words">{post.content}</p>
                  )}

                  {/* Image */}
                  {post.image_url && (
                    <img src={post.image_url} alt="post" className="w-full rounded-lg mb-3 max-h-64 object-cover" />
                  )}

                  {/* Favorite card */}
                  {post.favorite_id && (
                    <div className="bg-darkCard/50 border border-purple-500/30 rounded-lg p-3 mb-3 flex gap-3">
                      {post.favorite_image && (
                        <img src={post.favorite_image} alt={post.favorite_title} className="w-12 h-16 rounded object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted uppercase">{post.favorite_type}</p>
                        <p className="text-white text-sm font-semibold truncate">{post.favorite_title}</p>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-muted">
                    <span>❤️ {post.likes_count}</span>
                    <span>💬 {post.comments_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Section - 1 col */}
        <div className="lg:col-span-1">
          <div className="bg-darkCard rounded-xl p-6 shadow-card sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recomendaciones</h3>

            {recsError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-xs mb-4">
                {recsError}
              </div>
            )}

            {recsLoading && (
              <div className="flex justify-center py-8">
                <span className="text-xs text-muted">Cargando...</span>
              </div>
            )}

            {!recsLoading && recommendations.length === 0 && (
              <p className="text-muted text-xs text-center py-4">Sin recomendaciones disponibles</p>
            )}

            <div className="space-y-3">
              {recommendations.slice(0, 10).map((rec) => (
                <div key={rec.id} className="border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500/50 transition cursor-pointer">
                  <div className="flex gap-2">
                    {rec.image_url && (
                      <img src={rec.image_url} alt={rec.title} className="w-12 h-16 rounded-l object-cover" />
                    )}
                    <div className="flex-1 p-2 min-w-0">
                      <p className="text-xs text-muted uppercase">{rec.type}</p>
                      <p className="text-white text-xs font-semibold truncate">{rec.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
