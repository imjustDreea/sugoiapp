
# sugoiapp

Un proyecto full‑stack para explorar y recomendar contenido (anime, manga, juegos y más). Este repositorio contiene el frontend en Vite + React + TypeScript y un backend en Node.js que integra servicios como Supabase y la API de Jikan para datos de anime/manga.

**Estado:** En desarrollo

**Principales tecnologías:**
- **Frontend:** Vite, React, TypeScript
- **Backend:** Node.js
- **BD / Auth:** Supabase (cliente y utilidades incluidas)
- **APIs externas:** Jikan (pruebas incluidas en `test_fetch_jikan.js`)

**Estructura del repositorio**
- **`sugoiHub/`**: Carpeta principal con el frontend y backend del proyecto
	- **`backend/`**: Código del servidor (API, integración con Supabase)
		- `index.js`, `supabase.js`, `supabaseClient.js`, pruebas (`test_fetch_jikan.js`, `test-supabase.js`)
		- `api/` contiene las rutas de `anime` y `manga`
	- **`frontend/`**: Aplicación cliente (Vite + React + TypeScript)
		- `src/` contiene componentes, layouts, páginas y estilos
		- configuración: `vite.config.ts`, `tsconfig.*`, `tailwind.config.cjs`

**Qué hace el proyecto**
- Proporciona una interfaz para descubrir y recomendar anime, manga, juegos y música.
- Conecta con fuentes externas (por ejemplo Jikan) y persiste datos/usuarios con Supabase.
- Estructura modular pensada para ampliar con nuevas integraciones y microservicios.

**Instalación rápida (desarrollo)**
Requisitos: `node` (v16+ recomendado) y `npm` o `pnpm`.

Abre una terminal PowerShell y ejecuta:

```powershell
# Desde la raíz del repo
cd sugoiHub\backend
npm install
# Ejecuta el backend (usar el script disponible: npm run dev o npm start)
npm run dev

# En otra terminal, arranca el frontend
cd ..\frontend
npm install
npm run dev
```

Si algún `package.json` usa otro script para desarrollo usa `npm start` en su lugar.

**Variables de entorno**
- Revisa `sugoiHub/backend` para variables relacionadas con Supabase o claves de API.
- Crea un fichero `.env` en cada parte (backend/frontend) con las claves necesarias. Por ejemplo:

```
SUPABASE_URL=tu_url
SUPABASE_KEY=tu_key
JIKAN_API_KEY=opcional
```

**Ejecución de pruebas y utilidades**
- Hay scripts de prueba en `sugoiHub/backend` como `test_fetch_jikan.js` y `test-supabase.js` para validar integraciones.

**Contribuir**
- Crea un fork y abre un PR con una descripción clara del cambio.
- Para cambios mayores, abre una issue primero para discutir la propuesta.

**Ideas y próximos pasos**
- Añadir documentación de la API (OpenAPI / Swagger) para `sugoiHub/backend`.
- Integrar CI/CD para despliegues automáticos.
- Añadir tests unitarios y de integración.

**Contacto**
- Autor: andaa (repositorio local: `sugoiapp`)

—
Si quieres, adapto el README a formato en inglés, añado badges (ci, license) o incluyo ejemplos concretos de uso de la API. ¿Qué prefieres que haga a continuación?

