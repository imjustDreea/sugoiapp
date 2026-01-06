# Sesión “volátil” + JWT (explicación y fix)

## Qué pasaba (síntoma)
Al iniciar sesión, parecía que funcionaba, pero al recargar la página (F5) o navegar, a veces te redirigía a `/login` como si hubieras cerrado sesión.

## Causa principal
### 1) `PrivateRoute` redirigía demasiado pronto
En el arranque, el `AuthContext` recupera el token desde `localStorage` y hace una llamada a `/api/auth/me` para cargar el usuario.

Mientras ese proceso ocurre, `auth.loading` está en `true` y todavía no se ha actualizado el estado final (token/usuario). Si el router evalúa la ruta privada en ese instante y solo comprueba `auth.token`, puede redirigir a `/login` antes de terminar la restauración.

### 2) React `StrictMode` (desarrollo) puede ejecutar efectos 2 veces
En entorno de desarrollo, React puede ejecutar ciertos `useEffect` dos veces para detectar efectos secundarios. Esto puede provocar llamadas duplicadas y estados “raros” si no se controla la inicialización.

### 3) Logout “accidental” por errores temporales
Si `/api/auth/me` fallaba por un error de red o un 5xx temporal, el código limpiaba el token inmediatamente (como si fuese inválido). Resultado: sesión eliminada aunque el token siguiera siendo válido.

## Qué se cambió (fix)
### A) Esperar a `loading` en las rutas privadas
En [src/App.tsx](../App.tsx) `PrivateRoute` ahora:
- Si `auth.loading` es `true`, muestra un estado de “CARGANDO…”
- Solo decide redirigir a `/login` cuando ya terminó la restauración

Esto evita la redirección prematura.

### B) Evitar doble inicialización del `AuthContext` en `StrictMode`
En [src/context/AuthContext.tsx](../context/AuthContext.tsx) se añadió un `useRef` (`didInit`) para asegurar que la restauración inicial del token se ejecute una sola vez.

### C) No borrar token por fallos temporales
En `fetchUser()`:
- Si la respuesta es `401/403`: se considera token inválido/expirado → se limpia la sesión.
- Si la respuesta es 5xx (u otro error no-auth) o hay error de red: **no se borra el token** (se evita “volatilizar” la sesión por un fallo temporal).

## JWT en backend (instalación/estado)
El backend ya utiliza `jsonwebtoken` para:
- Firmar tokens en `POST /api/auth/login`
- Validarlos en el middleware `auth` para rutas protegidas (ej. `GET /api/auth/me`)

La dependencia está declarada en `sugoiHub/backend/package.json` como `jsonwebtoken`.

### Recomendación
Define `JWT_SECRET` en tu entorno (archivo `.env` en backend o variables del hosting). Si no existe, el código usa un fallback de desarrollo (`dev_secret_change_me`), que **no** es recomendable en producción.

## Cómo comprobarlo (manual)
1. Haz login.
2. Recarga la página (F5).
3. Deberías seguir dentro (sin salto a `/login`).
4. Si apagas el backend temporalmente, la UI no debería “borrarte” la sesión por error de red; al volver el backend, debería recuperar el usuario en la siguiente carga.
