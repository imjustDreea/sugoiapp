# SugoiHub - Backend (Express)

Simple Express API to serve sample `games` and `manga` data for the SugoiHub frontend.

## Requisitos
- Node.js 18+ (o 16 en la mayoría de casos)

## Instalación
Desde la carpeta `backend/` ejecuta:

```powershell
npm install
```

## Ejecutar en desarrollo
```powershell
npm run dev
```

Esto usa `nodemon` y levantará el servidor en `http://localhost:4000` por defecto.

## Endpoints útiles
- `GET /api/games` — lista de juegos. Opcional: `?q=` para filtrar por título.
- `GET /api/games/:id` — obtener juego por id.
- `GET /api/manga` — lista de mangas. Opcional: `?q=` para filtrar por título.
- `GET /api/manga/:id` — obtener manga por id.
- `GET /api/health` — health check.

## Conectar desde el frontend
Desde el frontend (por ejemplo `src/utils/supabase/api.tsx` o donde hagas fetch) puedes consumir las APIs en `http://localhost:4000/api/games`.

Ejemplo rápido:

```js
fetch('http://localhost:4000/api/games')
  .then(r => r.json())
  .then(data => console.log(data))
```

Asegúrate de que el backend esté corriendo y que no haya bloqueos de CORS (ya está habilitado por defecto en `index.js`).

---

Base de datos (SQLite)

Este backend ahora utiliza SQLite (archivo `backend/data/sugoi.db`) mediante `better-sqlite3`. Al arrancar el servidor, si la base no existe crea las tablas `games` y `manga` y si están vacías semillas los datos desde los JSON de `backend/data/*.json`.

Si necesitas resetear la base, borra `backend/data/sugoi.db` y vuelve a arrancar con `npm run dev`.
