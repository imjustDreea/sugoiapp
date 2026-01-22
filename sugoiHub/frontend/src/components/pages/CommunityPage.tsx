import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

type Post = {
  id: number;
  user_id: number;
  content: string | null;
  image_url: string | null;
  favorite_type: string | null;
  favorite_id: string | null;
  favorite_title: string | null;
  favorite_image: string | null;
  created_at: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
};

type FavoriteItem = {
  media_id: string;
  media_type: string;
  title: string;
  cover_url: string | null;
};

type Comment = {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
};

export default function CommunityPage() {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const { showToast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<number, Comment[]>>({});
  const [commentContent, setCommentContent] = useState<Record<number, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteItem | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [displayCount, setDisplayCount] = useState(6);
  const postsToDisplay = posts.slice(0, displayCount);

  useEffect(() => {
    loadPosts();
    loadFavorites();
  }, []);

  async function loadFavorites() {
    if (!token || !auth?.user) return;
    try {
      const res = await fetch(`/api/library/${auth.user.id}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok && data.items) {
        setFavorites(data.items);
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  }

  async function loadPosts() {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/posts?limit=50', { headers });
      const data = await res.json();
      if (data.ok) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error('Error loading posts:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createPost() {
    if (!token) return;
    if (!newPostContent.trim() && !uploadedImage && !selectedFavorite) {
      showToast('Escribe algo, sube una imagen o selecciona un favorito', 'error');
      return;
    }

    if (newPostContent.length > 500) {
      showToast('El contenido no puede superar 500 caracteres', 'error');
      return;
    }

    setPosting(true);
    try {
      const body: any = {
        content: newPostContent.trim() || null,
        image_url: uploadedImage || null
      };

      if (selectedFavorite) {
        body.favorite_type = selectedFavorite.media_type;
        body.favorite_id = selectedFavorite.media_id;
        body.favorite_title = selectedFavorite.title;
        body.favorite_image = selectedFavorite.cover_url;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      setNewPostContent('');
      setUploadedImage(null);
      setSelectedFavorite(null);
      loadPosts();
      showToast('Post publicado', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    } finally {
      setPosting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('La imagen no puede superar 10MB', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/posts/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.ok && data.image_url) {
        setUploadedImage(data.image_url);
        showToast('Imagen subida correctamente', 'success');
      } else {
        showToast('Error subiendo imagen', 'error');
      }
    } catch {
      showToast('Error subiendo imagen', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function toggleLike(postId: number) {
    if (!token || !auth?.user?.id) return;

    const post = posts.find(p => p.id === postId);
    const isLiked = post?.user_has_liked || likedPosts.has(postId);
    const method = isLiked ? 'DELETE' : 'POST';

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error');

      setLikedPosts(prev => {
        const next = new Set(prev);
        if (isLiked) next.delete(postId);
        else next.add(postId);
        return next;
      });

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1, user_has_liked: !isLiked }
          : p
      ));

      // Disparar evento para que el ProfilePage actualice sus estadísticas
      window.dispatchEvent(new CustomEvent('profileStatsUpdate', { detail: { userId: auth.user.id } }));
    } catch (e) {
      showToast('Error', 'error');
    }
  }

  async function loadComments(postId: number) {
    if (expandedComments[postId]) {
      setExpandedComments(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      if (data.ok) {
        setExpandedComments(prev => ({ ...prev, [postId]: data.comments }));
      }
    } catch (e) {
      console.error('Error loading comments:', e);
    }
  }

  async function addComment(postId: number) {
    if (!token || !commentContent[postId]?.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent[postId].trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      setCommentContent(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
      showToast('Comentario añadido', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
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
      <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="page-title text-2xl md:text-2.5xl">COMUNIDAD</h2>
        </div>
        <div className="text-center text-muted">Cargando...</div>
      </section>
    );
  }

  return (
    <section className="py-6 px-4 sm:px-5 lg:px-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="page-title text-2xl md:text-2.5xl">COMUNIDAD</h2>
      </div>

      {/* Crear post */}
      {token && (
        <div className="mb-6 bg-panel border border-grid rounded-xl p-4">
          <textarea
            placeholder="¿Qué estás pensando?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            maxLength={500}
            className={`w-full h-24 px-4 py-3 rounded-lg bg-dark text-white placeholder-gray-500 focus:outline-none transition resize-none ${
              newPostContent.length > 500 ? 'border-2 border-red-500' : 'border border-grid focus:border-accentLime'
            }`}
          />
          <div className="mt-2 text-xs text-right" style={{ color: newPostContent.length > 500 ? 'red' : 'gray' }}>
            {newPostContent.length}/500
          </div>

          {/* Vista previa imagen */}
          {uploadedImage && (
            <div className="relative mt-3">
              <img src={uploadedImage} alt="" className="w-full max-h-80 object-cover rounded-lg" />
              <button
                className="absolute top-2 right-2 pixel-btn pixel-btn-danger pixel-btn-icon-sm"
                onClick={() => setUploadedImage(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Vista previa favorito */}
          {selectedFavorite && (
            <div className="mt-3 p-3 rounded-lg flex items-center gap-3 bg-dark border border-grid">
              <img
                src={selectedFavorite.cover_url || '/placeholder.png'}
                alt=""
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="text-sm text-muted">{selectedFavorite.media_type}</div>
                <div className="font-semibold text-white">{selectedFavorite.title}</div>
              </div>
              <button
                className="pixel-btn pixel-btn-danger pixel-btn-icon-sm"
                onClick={() => setSelectedFavorite(null)}
              >
                ✕
              </button>
            </div>
          )}

          <div className="mt-3 flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <label className="pixel-btn pixel-btn-secondary pixel-btn-sm cursor-pointer">
                {uploading ? 'Subiendo...' : '📷 Imagen'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <button
                onClick={() => setShowFavoriteModal(true)}
                className="pixel-btn pixel-btn-secondary pixel-btn-sm"
              >
                ⭐ Favorito
              </button>
            </div>
            <button
              onClick={createPost}
              disabled={posting || (newPostContent.length > 500) || (!newPostContent.trim() && !uploadedImage && !selectedFavorite)}
              className="pixel-btn pixel-btn-primary pixel-btn-sm"
            >
              {posting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="crt-frame">
            <div className="crt-inner p-6 text-center">
              <p className="text-muted">No hay posts aún. ¡Sé el primero en publicar!</p>
            </div>
          </div>
        ) : (
          postsToDisplay.map(post => {
            const displayName = post.name || post.username;
            const initials = (post.username || 'U').trim().slice(0, 2).toUpperCase();
            const comments = expandedComments[post.id] || [];
            const showComments = !!expandedComments[post.id];

            return (
              <div key={post.id} className="bg-panel border border-grid rounded-xl p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <Link to={`/u/${post.username}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-black border-2 border-grid flex items-center justify-center overflow-hidden">
                      {post.avatar_url ? (
                        <img src={post.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="pixel-font text-xs text-accentLime">{initials}</span>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/u/${post.username}`} className="hover:text-accentLime transition">
                      <p className="font-semibold text-white">{displayName}</p>
                    </Link>
                    <p className="text-xs text-muted">@{post.username} · {formatDate(post.created_at)}</p>
                  </div>
                </div>

                {/* Content */}
                {post.content && (
                  <p className="mt-3 text-gray-300 whitespace-pre-wrap break-words">{post.content}</p>
                )}

                {/* Image */}
                {post.image_url && (
                  <img src={post.image_url} alt="Post" className="mt-3 w-full rounded-lg max-h-96 object-cover" />
                )}

                {/* Favorito adjunto */}
                {post.favorite_id && (
                  <div className="mt-3 p-3 rounded-lg flex items-center gap-3 bg-dark border border-grid">
                    <img
                      src={post.favorite_image || '/placeholder.png'}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="text-sm text-muted">{post.favorite_type}</div>
                      <div className="font-semibold text-white">{post.favorite_title}</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <button
                    onClick={() => toggleLike(post.id)}
                    disabled={!token}
                    className={`flex items-center gap-1 transition ${
                      (post.user_has_liked || likedPosts.has(post.id)) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <span>{(post.user_has_liked || likedPosts.has(post.id)) ? '❤️' : '🤍'}</span>
                    <span>{post.likes_count}</span>
                  </button>

                  <button
                    onClick={() => loadComments(post.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-accentLime transition"
                  >
                    <span>💬</span>
                    <span>{post.comments_count}</span>
                  </button>
                </div>

                {/* Comments */}
                {showComments && (
                  <div className="mt-4 pt-4 border-t border-grid space-y-3">
                    {token && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Escribe un comentario..."
                          value={commentContent[post.id] || ''}
                          onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                          className="flex-1 h-9 px-3 rounded-lg bg-dark border border-grid text-white placeholder-gray-500 focus:outline-none focus:border-accentLime transition text-sm"
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          disabled={!commentContent[post.id]?.trim()}
                          className="pixel-btn pixel-btn-primary pixel-btn-sm"
                        >
                          Enviar
                        </button>
                      </div>
                    )}

                    {comments.map(comment => {
                      const cDisplayName = comment.name || comment.username;
                      const cInitials = (comment.username || 'U').trim().slice(0, 2).toUpperCase();

                      return (
                        <div key={comment.id} className="flex gap-2">
                          <Link to={`/u/${comment.username}`} className="shrink-0">
                            <div className="w-8 h-8 rounded-full bg-black border border-grid flex items-center justify-center overflow-hidden">
                              {comment.avatar_url ? (
                                <img src={comment.avatar_url} alt={cDisplayName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="pixel-font text-[10px] text-accentLime">{cInitials}</span>
                              )}
                            </div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="bg-dark border border-grid rounded-lg px-3 py-2">
                              <Link to={`/u/${comment.username}`} className="hover:text-accentLime transition">
                                <p className="text-sm font-semibold text-white">{cDisplayName}</p>
                              </Link>
                              <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                            </div>
                            <p className="text-xs text-muted mt-1 ml-1">{formatDate(comment.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {displayCount < posts.length && (
          <div className="flex justify-center py-8">
            <button
              onClick={() => setDisplayCount(prev => prev + 6)}
              className="pixel-btn pixel-btn-primary"
            >
              Cargar Más Posts
            </button>
          </div>
        )}
      </div>

      {/* Modal de selección de favorito */}
      {showFavoriteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowFavoriteModal(false)}
        >
          <div
            className="bg-panel border border-grid rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-accentLime">Selecciona un favorito</h2>
              <button
                className="text-gray-400 hover:text-white text-2xl leading-none"
                onClick={() => setShowFavoriteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {favorites.map(fav => (
                <div
                  key={`${fav.media_type}-${fav.media_id}`}
                  className="p-3 rounded-lg cursor-pointer hover:bg-dark transition bg-dark/50 border border-grid"
                  onClick={() => {
                    setSelectedFavorite(fav);
                    setShowFavoriteModal(false);
                  }}
                >
                  <img
                    src={fav.cover_url || '/placeholder.png'}
                    alt=""
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="text-xs text-muted mb-1">{fav.media_type}</div>
                  <div className="text-sm font-semibold text-white truncate">{fav.title}</div>
                </div>
              ))}
            </div>
            {favorites.length === 0 && (
              <div className="text-center py-12 text-muted">
                No tienes favoritos aún. Añade algunos desde las páginas de Anime, Manga o Juegos.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
