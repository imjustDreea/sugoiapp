import { useCallback, useEffect, useState, useContext } from "react";
import { getApiBase } from "./apiBase";
import { LikesContext } from "../context/LikesContext";

export function useLike({ type, id, token }: { type: string; id: string | number; token?: string | null }) {
  const likesContext = useContext(LikesContext);
  const apiBase = getApiBase();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(false);

  // GET likes
  const fetchLikes = useCallback(async () => {
    if (!id || !token) {
      console.log(`[useLike] Skipping fetch: id=${id}, token=${!!token}`);
      return;
    }
    
    console.log(`[useLike] Fetching likes for ${type}:${id}`);
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    try {
      const url = `${apiBase}/api/media/${type}/${encodeURIComponent(String(id))}/likes`;
      console.log(`[useLike] URL: ${url}`);
      const res = await fetch(url, { headers });
      console.log(`[useLike] Response status: ${res.status}`);
      
      const data = await res.json().catch(() => ({}));
      console.log(`[useLike] Response data:`, data);
      
      if (!res.ok) throw new Error((data as any)?.error || "Error");
      
      const likesCount = Number((data as any)?.likes) || 0;
      const isLiked = Boolean((data as any)?.liked);
      
      console.log(`[useLike] Setting state: liked=${isLiked}, likes=${likesCount}`);
      setLikes(likesCount);
      setLiked(isLiked);
      
      if (likesContext) {
        likesContext.setLike(type, id, isLiked, likesCount);
      }
    } catch (err) {
      console.error('[useLike] Error fetching likes:', err);
      setLikes(0);
      setLiked(false);
    }
  }, [type, id, token, apiBase]);

  // Trigger fetch on mount and when deps change
  useEffect(() => {
    console.log(`[useLike] useEffect triggered for ${type}:${id}`);
    fetchLikes();
  }, [fetchLikes]);

  // POST toggle like
  const toggleLike = useCallback(async () => {
    if (!token) {
      console.warn('[useLike] No token available for toggle like');
      return;
    }
    
    console.log(`[useLike] Toggling like for ${type}:${id}`);
    setLoading(true);
    try {
      const url = `${apiBase}/api/media/${type}/${encodeURIComponent(String(id))}/likes`;
      console.log(`[useLike] POST URL: ${url}`);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[useLike] POST Response status: ${res.status}`);
      
      const data = await res.json().catch(() => ({}));
      console.log(`[useLike] POST Response data:`, data);
      
      if (!res.ok) throw new Error((data as any)?.error || "Error");
      
      const likesCount = Number((data as any)?.likes) || 0;
      const isLiked = Boolean((data as any)?.liked);
      
      console.log(`[useLike] Updated state after toggle: liked=${isLiked}, likes=${likesCount}`);
      setLikes(likesCount);
      setLiked(isLiked);
      
      if (likesContext) {
        likesContext.setLike(type, id, isLiked, likesCount);
      }
    } catch (err) {
      console.error('[useLike] Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  }, [type, id, token, apiBase]);

  const returnValue = { liked, likes, loading, toggleLike };
  console.log(`[useLike] Returning:`, returnValue);
  return returnValue;
}
