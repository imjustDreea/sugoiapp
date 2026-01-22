export function getApiBase(): string {
  const raw = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '';
  const base = String(raw).trim().replace(/\/$/, '');

  // Si la app se está sirviendo por HTTPS y el backend está configurado como HTTP,
  // Chrome mostrará warnings de Mixed Content y puede bloquear la petición.
  // En ese caso usamos rutas relativas (misma origin), que es la configuración
  // esperada cuando Express sirve el SPA.
  if (
    typeof window !== 'undefined' &&
    window.location?.protocol === 'https:' &&
    base.startsWith('http://')
  ) {
    return '';
  }

  return base;
}
