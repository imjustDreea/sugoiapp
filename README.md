
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
# sugoiHub - Plataforma de Recomendación de Contenido

Una plataforma full-stack para explorar, gestionar y recomendar contenido multimedia (anime, manga, juegos y música). Incluye autenticación de usuarios, sistema de recomendaciones, perfiles y una comunidad integrada.

## 📋 Estado del Proyecto

En desarrollo activo - Trabajo de Fin de Grado (TFG)

## 🛠️ Tecnologías Principales

| Capa           | Tecnologías                                 |
|----------------|---------------------------------------------|
| **Frontend**   | Vite, React 18+, TypeScript, Tailwind CSS   |
| **Backend**    | Node.js, Express                            |
| **Base de Datos** | PostgreSQL (Neon)                        |
| **Autenticación** | JWT + Neon Auth                          |
| **APIs Externas** | Jikan (Anime/Manga), APIs de Juegos y Música |

## 📁 Estructura del Proyecto

```
sugoiapp/
└── sugoiHub/
	├── backend/
	│   ├── api/
	│   │   ├── anime/
	│   │   ├── manga/
	│   │   ├── games/
	│   │   ├── music/
	│   │   ├── posts/
	│   │   ├── profile/
	│   │   ├── auth/
	│   │   ├── library/
	│   │   ├── recommendations/
	│   │   └── media/
	│   ├── middleware/
	│   ├── migrations/
	│   ├── uploads/
	│   ├── db.js
	│   ├── index.js
	│   └── package.json
	└── frontend/
		├── src/
		│   ├── components/
		│   │   ├── pages/
		│   │   ├── allPages/
		│   │   ├── homeComponents/
		│   │   ├── games/
		│   │   ├── manga/
		│   │   ├── music/
		│   │   ├── pixel/
		│   │   └── ui/
		│   ├── context/
		│   ├── layouts/
		│   ├── lib/
		│   ├── assets/
		│   ├── App.tsx
		│   └── main.tsx
		├── vite.config.ts
		├── tailwind.config.cjs
		└── package.json
```

## ✨ Funcionalidades Principales

### 🔐 Autenticación y Perfiles
- Registro e inicio de sesión con JWT
- Perfiles de usuario personalizables
- Sistema de seguidores (followers/following)
- Perfiles públicos

### 📚 Gestión de Contenido
- Exploración y búsqueda de anime, manga, juegos y música
- Integración con API Jikan para datos de anime/manga
- Sistema de puntuaciones y recomendaciones
- Biblioteca personal del usuario

### 👥 Comunidad
- Feed de posts de usuarios
- Sistema de likes en posts
- Recomendaciones personalizadas
- Sección de descubrimiento

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v16+
- npm o pnpm
- Cuenta de Supabase (para BD y Auth)

### Pasos de Instalación

**1. Backend**
```powershell
cd sugoiHub\backend
npm install
```

**2. Frontend**
```powershell
cd ..\frontend
npm install
```

### Variables de Entorno

Crea un archivo `.env` en `sugoiHub/backend/`:
```env
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/sugoidb


# Neon (si se usa)
NEON_DATABASE_URL=your_neon_database_url
NEON_API_KEY=your_neon_api_key


# JWT
JWT_SECRET=your_secret_key

# APIs Externas
JIKAN_API_KEY=opcional
```

Crea un archivo `.env` en `sugoiHub/frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

## 🔧 Desarrollo

### Ejecutar Backend
```powershell
cd sugoiHub\backend
npm run dev
```
Servidor disponible en: `http://localhost:3000`

### Ejecutar Frontend
```powershell
cd sugoiHub\frontend
npm run dev
```
Aplicación disponible en: `http://localhost:5173`

### Scripts Útiles Backend
```powershell
npm run dev              # Desarrollo con hot reload
npm start               # Producción
npm run seed-test-data  # Carga datos de prueba
npm run reset-posts     # Resetea la tabla de posts
```

## 📖 Documentación Adicional

- [BUTTON_SYSTEM.md](sugoiHub/frontend/BUTTON_SYSTEM.md) - Sistema de botones
- [DEV_FIX.md](sugoiHub/frontend/DEV_FIX.md) - Notas de desarrollo
- [README.md](sugoiHub/backend/README.md) - Documentación del backend

## 🗄️ Base de Datos

Las migraciones se encuentran en `sugoiHub/backend/migrations/`. Principales tablas:
- `users` - Información de usuarios
- `profiles` - Datos extendidos de perfil
- `posts` - Posts de la comunidad
- `likes` - Sistema de likes
- `followers` - Relaciones de seguimiento
- Tablas de contenido (anime, manga, games, music)

## 🚢 Despliegue

El proyecto está configurado para despliegue en Render. Consulta `render.yaml` para más detalles.

## 📝 Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🎯 Próximas Mejoras

- [ ] Documentación API completa (Swagger/OpenAPI)
- [ ] Tests unitarios e integración
- [ ] CI/CD pipeline mejorado
- [ ] Optimización de performance
- [ ] Más integraciones de APIs de contenido

## 👤 Autor

**imjustDreea** - Repositorio: `sugoiapp`

## 📄 Licencia

Este proyecto es parte de un Trabajo de Fin de Grado.

---

**Para dudas o problemas**, abre una issue en el repositorio.
