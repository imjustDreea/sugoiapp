# 📚 sugoiapp - Documentación Completa para TFG

**Autor:** andaa  
**Fecha:** 22 de enero de 2026  
**Versión:** 0.1.0 (En desarrollo)  
**Estado:** Proyecto en desarrollo

---

## 📋 ÍNDICE

1. [Descripción General](#descripción-general)
2. [Objetivos del Proyecto](#objetivos-del-proyecto)
3. [Arquitectura General](#arquitectura-general)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Backend - Node.js + Express](#backend---nodejs--express)
6. [Frontend - React + TypeScript + Vite](#frontend---react--typescript--vite)
7. [Base de Datos](#base-de-datos)
8. [API REST](#api-rest)
9. [Flujo de Autenticación](#flujo-de-autenticación)
10. [Instalación y Configuración](#instalación-y-configuración)
11. [Funcionalidades Implementadas](#funcionalidades-implementadas)
12. [Estructura de Carpetas Completa](#estructura-de-carpetas-completa)
13. [Próximos Pasos y Mejoras](#próximos-pasos-y-mejoras)

---

## 📖 Descripción General

**sugoiapp** es una plataforma web full-stack diseñada como red social multimedia para explorar, descubrir y recomendar contenido:

- **Anime** - Búsqueda de series con integración a API Jikan
- **Manga** - Catálogo de cómics
- **Videojuegos** - Base de datos de juegos
- **Música** - Recomendaciones musicales

La aplicación combina características de:
- 🎬 **Plataforma de descubrimiento** (como MyAnimeList, TMDB)
- 👥 **Red social** (perfiles, seguidores, posts)
- 📚 **Biblioteca personal** (watchlists, favoritos)
- 🎮 **Sistema de comunidad** (likes, comentarios)

---

## 🎯 Objetivos del Proyecto

### Objetivos Generales:
1. Crear una plataforma integrada para gestionar múltiples tipos de contenido multimedia
2. Permitir que usuarios descubran y compartan recomendaciones
3. Implementar un sistema modular y escalable para futuras integraciones

### Objetivos Técnicos:
1. Desarrollar una API REST robusta con autenticación JWT
2. Crear una interfaz moderna y responsiva con React/TypeScript
3. Integrar APIs externas (Jikan, etc.)
4. Implementar persistencia de datos con PostgreSQL
5. Aplicar buenas prácticas de seguridad (bcrypt, JWT)
6. Usar patrones de desarrollo modular y escalable

### Objetivos de Usuario:
1. Permitir registro e inicio de sesión seguro
2. Gestionar biblioteca personal de contenido
3. Crear y compartir posts con la comunidad
4. Ver perfiles públicos de otros usuarios
5. Seguir a otros usuarios (followers)
6. Marcar contenido como favorito o para ver después

---

## 🏗️ Arquitectura General

### Estructura del Proyecto:

```
sugoiapp/
│
├── package.json (root - scripts concurrentes)
├── README.md
│
└── sugoiHub/                    ← Carpeta principal del proyecto
    ├── package.json
    ├── render.yaml              ← Configuración para deploy (Render.com)
    │
    ├── backend/                 ← API REST (Node.js + Express)
    │   ├── index.js             ← Entry point del servidor
    │   ├── db.js                ← Conexión PostgreSQL
    │   ├── package.json
    │   ├── middleware/
    │   ├── api/                 ← Rutas de API
    │   ├── migrations/          ← Scripts SQL
    │   └── uploads/             ← Archivos cargados
    │
    └── frontend/                ← Aplicación React (Vite)
        ├── index.html
        ├── vite.config.ts
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── App.tsx          ← Enrutamiento principal
            ├── main.tsx
            ├── types.ts         ← Tipos TypeScript globales
            ├── theme.ts         ← Configuración de tema
            ├── components/      ← Componentes React
            ├── context/         ← Context API (Auth, Likes, Toast)
            ├── layouts/         ← Layouts principales
            ├── lib/             ← Utilidades y hooks
            └── pages/           ← Componentes de página
```

### Diagrama de Flujo:

```
Usuario (Navegador)
        ↓
   Frontend (React)
        ↓
   [Context API + Fetch]
        ↓
   Backend (Express API)
        ↓
   [JWT + Middleware Auth]
        ↓
   PostgreSQL Database
        ↓
   [Almacenamiento de datos]
```

---

## 🛠️ Tecnologías Utilizadas

### Backend Stack:

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|----------|
| **Runtime** | Node.js | 18.x | Ejecución de JavaScript |
| **Framework** | Express.js | 4.18.2 | Framework web minimalista |
| **BD** | PostgreSQL | 13+ | Base de datos relacional |
| **Driver BD** | pg | 8.16.3 | Conexión a PostgreSQL |
| **Autenticación** | JWT | 9.0.3 | Tokens seguros |
| **Seguridad** | bcrypt | 6.0.0 | Hasheo de contraseñas |
| **Carga de archivos** | Multer | 2.0.2 | Gestión de uploads |
| **CORS** | cors | 2.8.5 | Control de orígenes |
| **Variables de entorno** | dotenv | 16.0.0 | Configuración |
| **HTTP Client** | node-fetch | 3.3.2 | Llamadas HTTP |
| **Desarrollo** | Nodemon | 3.1.11 | Recarga automática |

### Frontend Stack:

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|----------|
| **Framework** | React | 19.1.1 | Librería UI |
| **Lenguaje** | TypeScript | ~5.9.3 | Tipado estático |
| **Build** | Vite | 7.1.7 | Build tool ultra-rápido |
| **Enrutamiento** | React Router | 6.30.2 | Navegación entre páginas |
| **Estilos** | TailwindCSS | 4.1.17 | CSS utility-first |
| **Iconos** | Lucide React | 0.553.0 | Biblioteca de iconos |
| **TypeScript** | TypeScript ESLint | 8.45.0 | Linting de TypeScript |

### Integraciones Externas:

- **API Jikan** - Datos de anime y manga
- **PostgreSQL** - Base de datos relacional
- **Render.com** - Deploy y hosting

---

## 🖥️ Backend - Node.js + Express

### Estructura Detallada:

```
backend/
├── index.js                          ← Punto de entrada
├── db.js                             ← Pool de conexión PostgreSQL
├── package.json
├── package-lock.json
│
├── middleware/
│   └── auth.js                       ← Validación de JWT
│
├── api/
│   ├── profile.js                    ← Ruta de perfil (antes del refactor)
│   ├── auth/
│   │   └── index.js                  ← Login, Register, /me
│   ├── anime/
│   │   └── index.js                  ← CRUD anime + caché
│   ├── manga/
│   │   └── index.js                  ← CRUD manga
│   ├── games/
│   │   └── index.js                  ← CRUD videojuegos
│   ├── music/
│   │   └── index.js                  ← CRUD música
│   ├── media/
│   │   └── index.js                  ← Detalles de media
│   ├── library/
│   │   └── index.js                  ← Biblioteca personal
│   ├── posts/
│   │   └── index.js                  ← Posts comunidad
│   └── profile/
│       └── index.js                  ← Operaciones de perfil
│
├── migrations/
│   └── create_followers_table.sql    ← Script SQL migrations
│
├── uploads/
│   ├── posts/
│   │   └── 2/                        ← Uploads de posts por user
│   └── profiles/
│       └── 2/                        ← Avatares y banners
│
├── check-posts.js                    ← Script de verificación
├── create-media-tables.js            ← Script para crear tablas
├── expand-activity.js                ← Script para actividad
├── gen-hash.js                       ← Generador de hashes
├── reset-posts-table.js              ← Reset de posts
└── seed-*.js                         ← Scripts de seed (datos de prueba)
```

### Puntos Clave del Backend:

#### 1. **Entry Point (index.js)**

Responsabilidades principales:
- Inicializar servidor Express
- Configurar CORS
- Crear tablas de la BD automáticamente:
  - `users` - Usuarios registrados
  - `profile` - Perfiles extendidos (1:1)
  - `library_items` - Biblioteca personal
  - `anime_likes` - Likes en anime
  - `manga_likes` - Likes en manga
  - `posts` - Posts de comunidad
  - `followers` - Sistema de seguidores
  - Migraciones automáticas de tablas antiguas

#### 2. **Conexión a BD (db.js)**

```javascript
// Pool de conexión PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

**Variables de entorno necesarias:**
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=tu_clave_secreta_aqui
NODE_ENV=development|production
PORT=3000
```

#### 3. **Autenticación (middleware/auth.js)**

- Valida token JWT en cada petición protegida
- Extrae usuario del token
- Maneja errores de token inválido/expirado

#### 4. **API de Autenticación (api/auth/index.js)**

**Endpoints:**

| Método | Ruta | Parámetros | Respuesta |
|--------|------|-----------|----------|
| POST | `/api/auth/login` | `{identifier, password}` | `{token, user}` |
| POST | `/api/auth/register` | `{username, name, last_name, email, password, birth?}` | `{token, user}` |
| GET | `/api/auth/me` | Header: `Authorization: Bearer <token>` | `{user}` |

**Flujo de login:**
1. Busca usuario por email o username
2. Valida contraseña con bcrypt
3. Genera JWT (válido 7 días)
4. Retorna token y datos de usuario

**Flujo de registro:**
1. Valida que email no exista
2. Hashea contraseña con bcrypt (10 rounds)
3. Crea usuario y perfil asociado
4. Retorna token y usuario creado

#### 5. **API de Anime (api/anime/index.js)**

**Características especiales:**
- **Caché en memoria** para reducir llamadas a Jikan
- **Filtrado de hentai** (prohibido en la plataforma)
- **Retry automático** en caso de rate limiting (429)
- **Compresión de datos** en respuestas

**Endpoints principales:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/anime` | Listado con filtros |
| GET | `/api/anime/:id` | Detalle de anime |
| POST | `/api/anime/:id/like` | Marcar como favorito |
| POST | `/api/anime/:id/unlike` | Quitar de favoritos |

**Parámetros de búsqueda:**
```
GET /api/anime?query=attack&page=1&limit=20
GET /api/anime?genre=Action&order_by=score
GET /api/anime?min_score=8.0
```

#### 6. **API de Biblioteca (api/library/index.js)**

**Tabla estructura:**
```sql
CREATE TABLE library_items (
  user_id INTEGER,
  media_type TEXT,        -- 'anime', 'manga', 'games', 'music'
  list_key TEXT,          -- 'favorites', 'later', 'completed'
  external_id TEXT,       -- ID de la fuente externa
  title TEXT,
  image_url TEXT,
  meta JSONB,             -- Metadata flexible
  created_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, media_type, list_key, external_id)
);
```

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/library/:media_type/:list_key` | Obtener lista |
| POST | `/api/library/:media_type/:list_key` | Agregar a lista |
| DELETE | `/api/library/:media_type/:list_key/:id` | Quitar de lista |

#### 7. **API de Posts (api/posts/index.js)**

- Crear posts de comunidad
- Comentarios
- Likes en posts
- Eliminación de posts
- Carga de imágenes/videos

#### 8. **API de Perfiles (api/profile/index.js)**

- Ver perfil de usuario
- Editar perfil propio
- Subir avatar y banner
- Gestionar información personal
- Ver seguimientos

#### 9. **Sistema de Migraciones**

`create_followers_table.sql` - Script para crear tabla de followers:
```sql
CREATE TABLE IF NOT EXISTS followers (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
```

### Base de Datos Completa:

#### Tabla `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name VARCHAR(100),
  last_name VARCHAR(100),
  birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla `profile`
```sql
CREATE TABLE profile (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  theme JSONB,           -- {primaryColor, secondaryColor, ...}
  badges JSONB,          -- Insignias ganadas
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla `library_items`
```sql
CREATE TABLE library_items (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  list_key TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, media_type, list_key, external_id)
);

CREATE INDEX idx_library_items_user_type_list_created
  ON library_items (user_id, media_type, list_key, created_at DESC);
```

#### Tabla `anime_likes`
```sql
CREATE TABLE anime_likes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, anime_id)
);
```

#### Tabla `posts`
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_type TEXT,       -- 'anime', 'manga', 'games', 'music'
  media_id TEXT,
  images JSONB,          -- URLs de imágenes
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla `followers`
```sql
CREATE TABLE followers (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
```

---

## 🎨 Frontend - React + TypeScript + Vite

### Estructura Detallada:

```
frontend/src/
│
├── App.tsx                          ← Enrutamiento principal
├── main.tsx                         ← Entry point React
├── index.css                        ← Estilos globales
├── App.css                          ← Estilos específicos
├── theme.ts                         ← Configuración de tema
├── types.ts                         ← Tipos TypeScript globales
│
├── components/
│   ├── TestConn.tsx                 ← Componente de prueba
│   │
│   ├── allPages/                    ← Componentes reutilizables
│   │   ├── Logo.tsx                 ← Logo de la app
│   │   ├── Sidebar.tsx              ← Barra lateral
│   │   ├── Topbar.tsx               ← Barra superior
│   │   ├── UserMenu.tsx             ← Menú de usuario
│   │   ├── MainCard.tsx             ← Card genérica
│   │   └── WikiSection.tsx          ← Sección informativa
│   │
│   ├── pages/                       ← Componentes de página (routed)
│   │   ├── HomePage.tsx             ← Inicio (feed recomendaciones)
│   │   ├── AnimePage.tsx            ← Listado de anime
│   │   ├── MangaPage.tsx            ← Listado de manga
│   │   ├── GamesPage.tsx            ← Listado de juegos
│   │   ├── MusicPage.tsx            ← Listado de música
│   │   ├── DiscoverPage.tsx         ← Descubrimiento
│   │   ├── CommunityPage.tsx        ← Posts y comunidad
│   │   ├── MediaDetailPage.tsx      ← Detalle de media (anime/manga/games/music)
│   │   ├── ProfilePage.tsx          ← Perfil antiguo
│   │   ├── ProfilePageNew.tsx       ← Perfil nuevo
│   │   ├── ProfileEditPage.tsx      ← Editar perfil
│   │   ├── PublicProfilePage.tsx    ← Ver perfil de otros
│   │   ├── LoginPage.tsx            ← Inicio de sesión
│   │   └── RegisterPage.tsx         ← Registro
│   │
│   ├── homeComponents/              ← Componentes del inicio
│   │   ├── ProfileCard.tsx          ← Card de perfil
│   │   └── RecommendationCard.tsx   ← Card de recomendación
│   │
│   ├── games/
│   │   └── GameCard.tsx             ← Card de juego
│   │
│   ├── manga/
│   │   └── MangaCard.tsx            ← Card de manga
│   │
│   ├── music/
│   │   └── MusicCard.tsx            ← Card de música
│   │
│   ├── pixel/
│   │   └── PixelIcons.tsx           ← Iconos pixel art
│   │
│   └── ui/                          ← Componentes reutilizables
│       ├── Button.tsx               ← Botón genérico
│       ├── LikeButton.tsx           ← Botón de like
│       └── README.md                ← Documentación UI
│
├── context/                         ← Context API (Global State)
│   ├── AuthContext.tsx              ← Autenticación y usuario
│   ├── LikesContext.tsx             ← Estado de likes
│   └── ToastContext.tsx             ← Notificaciones toast
│
├── layouts/
│   └── MainLayout.tsx               ← Layout principal (Sidebar + Topbar + Outlet)
│
├── lib/                             ← Utilidades y hooks
│   ├── apiBase.ts                   ← Configuración base para fetch
│   ├── library.ts                   ← Operaciones de biblioteca
│   ├── useLike.ts                   ← Hook para likes
│   └── ...
│
├── assets/                          ← Imágenes, fuentes, etc.
│
└── pages/                           ← Dashboards o páginas especiales
    └── Dashboard.tsx
```

### Enrutamiento Principal (App.tsx):

```typescript
// Rutas públicas (sin autenticación)
/login                 → LoginPage
/register              → RegisterPage
/u/:username           → PublicProfilePage (perfil público)

// Rutas protegidas (requieren token JWT)
/                      → HomePage
/home                  → HomePage
/anime                 → AnimePage
/anime/:id             → MediaDetailPage (type="anime")
/manga                 → MangaPage
/manga/:id             → MediaDetailPage (type="manga")
/games                 → GamesPage
/games/:id             → MediaDetailPage (type="games")
/music                 → MusicPage
/music/:id             → MediaDetailPage (type="music")
/discover              → DiscoverPage
/community             → CommunityPage
/profile               → ProfilePageNew (mi perfil)
/profile/edit          → ProfileEditPage (editar perfil)
```

### Context API - State Management:

#### 1. **AuthContext.tsx**

Maneja toda la autenticación:

```typescript
type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username, name, last_name, email, password, birth?) => Promise<void>;
  logout: () => void;
};
```

**Funcionalidades:**
- Persistencia en localStorage
- Carga automática de sesión al montar
- Manejo de token expirado
- Validación de credenciales
- Protección de rutas

#### 2. **LikesContext.tsx**

Gestiona likes globales en tiempo real:
- Agregar/quitar likes
- Sincronizar con servidor
- Actualización en tiempo real

#### 3. **ToastContext.tsx**

Sistema de notificaciones:
- Mostrar toasts (success, error, info, warning)
- Auto-dismiss
- Queue de mensajes

### Componentes Importantes:

#### **MainLayout.tsx**
Layout principal que envuelve todas las páginas protegidas:
- Sidebar con navegación
- Topbar con usuario
- Outlet para el contenido de página

#### **AnimePage.tsx** (archivo actual)
- Listado de anime con búsqueda
- Filtros por género, puntuación, estado
- Paginación
- Cards de anime
- Integración con API backend

#### **HomePage.tsx**
- Feed de recomendaciones
- Animes recomendados
- Contenido personalizado
- Cards de perfil

#### **ProfilePageNew.tsx**
- Información de usuario
- Estadísticas
- Insignias
- Enlaces a biblioteca

### Componentes UI Reutilizables:

#### **Button.tsx**
```typescript
<Button variant="primary" size="md" onClick={handler}>
  Click me
</Button>
```

Variantes: primary, secondary, danger, warning, success
Tamaños: sm, md, lg

#### **LikeButton.tsx**
```typescript
<LikeButton 
  liked={isLiked}
  count={likeCount}
  onToggle={handleLike}
/>
```

### Estilos (Tailwind CSS):

Configuración en `tailwind.config.cjs`:
- Colores personalizados
- Tema oscuro soportado
- Responsive design
- Utilidades extendidas

### TypeScript - Tipos Globales (types.ts):

```typescript
// Tipos comunes del proyecto
type User = {
  id: number;
  username: string;
  name: string;
  last_name: string;
  email: string;
};

type Anime = {
  id: string;
  title: string;
  image_url: string;
  synopsis: string;
  score: number;
  episodes: number;
  genres: string[];
  status: string;
};

type LibraryItem = {
  user_id: number;
  media_type: 'anime' | 'manga' | 'games' | 'music';
  list_key: 'favorites' | 'later' | 'completed';
  external_id: string;
  title: string;
  image_url: string;
  meta: Record<string, any>;
};

// ... más tipos
```

---

## 🌐 API REST

### Base URL:
```
Development: http://localhost:3000
Production: https://sugoihub.onrender.com (o tu dominio)
```

### Autenticación:
Todos los endpoints protegidos requieren:
```
Header: Authorization: Bearer <token_jwt>
```

### Endpoints Completos:

#### **Autenticación**

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me                 (requiere auth)
```

#### **Anime**

```
GET    /api/anime                   (búsqueda, filtros, paginación)
GET    /api/anime/:id               (detalle)
POST   /api/anime/:id/like          (requiere auth)
DELETE /api/anime/:id/like          (requiere auth)
```

#### **Manga**

```
GET    /api/manga                   (búsqueda)
GET    /api/manga/:id               (detalle)
POST   /api/manga/:id/like          (requiere auth)
DELETE /api/manga/:id/like          (requiere auth)
```

#### **Juegos**

```
GET    /api/games                   (búsqueda)
GET    /api/games/:id               (detalle)
```

#### **Música**

```
GET    /api/music                   (búsqueda)
GET    /api/music/:id               (detalle)
```

#### **Biblioteca**

```
GET    /api/library/:media_type/:list_key       (obtener lista)
POST   /api/library/:media_type/:list_key       (agregar)
DELETE /api/library/:media_type/:list_key/:id   (quitar)
```

Valores válidos:
- `media_type`: anime, manga, games, music
- `list_key`: favorites, later, completed

#### **Posts**

```
GET    /api/posts                   (listado con paginación)
POST   /api/posts                   (crear, requiere auth)
GET    /api/posts/:id               (detalle)
DELETE /api/posts/:id               (eliminar, requiere auth)
POST   /api/posts/:id/like          (like, requiere auth)
DELETE /api/posts/:id/like          (unlike, requiere auth)
```

#### **Perfiles**

```
GET    /api/profile/:username       (perfil público)
GET    /api/profile/me              (mi perfil, requiere auth)
PUT    /api/profile/me              (editar, requiere auth)
POST   /api/profile/avatar          (subir avatar, requiere auth)
POST   /api/profile/banner          (subir banner, requiere auth)
```

#### **Followers**

```
GET    /api/followers/:username     (seguidores)
POST   /api/followers/:username     (seguir, requiere auth)
DELETE /api/followers/:username     (dejar de seguir, requiere auth)
```

### Ejemplos de Peticiones:

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "andaa", "password": "mypassword"}'
```

**Obtener anime:**
```bash
curl -X GET "http://localhost:3000/api/anime?query=attack&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Agregar a biblioteca:**
```bash
curl -X POST http://localhost:3000/api/library/anime/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "external_id": "1535",
    "title": "Attack on Titan",
    "image_url": "https://...",
    "meta": {}
  }'
```

---

## 🔐 Flujo de Autenticación

### 1. Registro:

```
Usuario llena formulario
        ↓
Frontend valida datos
        ↓
POST /api/auth/register
        ↓
Backend valida email único
        ↓
Hashea contraseña (bcrypt)
        ↓
Crea usuario + perfil
        ↓
Genera JWT (7 días)
        ↓
Retorna token + usuario
        ↓
Frontend guarda en localStorage
```

### 2. Login:

```
Usuario introduce credenciales
        ↓
POST /api/auth/login
        ↓
Backend busca por email/username
        ↓
Valida contraseña con bcrypt
        ↓
Genera JWT (7 días)
        ↓
Retorna token + usuario
        ↓
Frontend almacena: localStorage.setItem('token', token)
```

### 3. Peticiones Autenticadas:

```
Frontend realiza fetch
        ↓
Incluye header: Authorization: Bearer <token>
        ↓
Backend middleware valida JWT
        ↓
Extrae usuario del token
        ↓
Continúa con la lógica
```

### 4. Logout:

```
Usuario click en logout
        ↓
Frontend limpia localStorage
        ↓
Frontend limpia estado de auth
        ↓
Redirige a /login
```

### Token JWT:

**Estructura:**
```json
{
  "id": 2,
  "username": "andaa",
  "email": "andaa@example.com",
  "iat": 1642432800,
  "exp": 1643037600
}
```

**Validez:** 7 días desde emisión

**Almacenamiento:** localStorage (key: 'token')

---

## 💻 Instalación y Configuración

### Requisitos Previos:

1. **Node.js 18+**
   ```bash
   node --version  # v18.x o superior
   ```

2. **PostgreSQL 13+**
   ```bash
   psql --version  # 13+ recomendado
   ```

3. **npm o pnpm**
   ```bash
   npm --version   # 8+ recomendado
   ```

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/imjustDreea/sugoiapp.git
cd sugoiapp
```

### Paso 2: Configurar Backend

```bash
cd sugoiHub/backend

# Instalar dependencias
npm install

# Crear archivo .env
# Contenido del .env:
# DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/sugoiapp
# JWT_SECRET=tu_clave_secreta_muy_segura
# NODE_ENV=development
# PORT=3000

# Iniciar servidor
npm run dev
# Servidor disponible en http://localhost:3000
```

**Variables de entorno necesarias:**

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/sugoiapp

# Seguridad JWT
JWT_SECRET=cambiar_por_valor_aleatorio_seguro

# Entorno
NODE_ENV=development

# Puerto
PORT=3000

# Opcional: API Keys externas
JIKAN_API_KEY=opcional
```

**Crear base de datos:**

```sql
-- Conectarse como admin
psql -U postgres

-- Crear base de datos
CREATE DATABASE sugoiapp;

-- Conectarse a la base
\c sugoiapp

-- Las tablas se crean automáticamente al iniciar el servidor
-- (via index.js - ensureXXXTable functions)
```

### Paso 3: Configurar Frontend

```bash
cd sugoiHub/frontend

# Instalar dependencias
npm install

# Crear archivo .env (si es necesario)
# VITE_API_URL=http://localhost:3000

# Iniciar dev server
npm run dev
# Accesible en http://localhost:5173
```

### Paso 4: Ejecutar Ambos Simultáneamente (Recomendado)

Desde la raíz del proyecto:

```bash
# Terminal principal
npm run dev

# Ejecuta backend y frontend en paralelo:
# Backend en http://localhost:3000
# Frontend en http://localhost:5173
```

### Build para Producción:

**Backend:**
```bash
cd sugoiHub/backend
# Ya está listo, solo ejecutar npm start
npm start
```

**Frontend:**
```bash
cd sugoiHub/frontend
npm run build
# Genera carpeta dist/
npm run preview  # Vista previa del build
```

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticación
- ✅ Registro de usuarios (con validación)
- ✅ Login con email/username
- ✅ JWT tokens (7 días de validez)
- ✅ Rutas protegidas
- ✅ Logout
- ✅ Persistencia de sesión (localStorage)

### 📚 Gestión de Contenido

**Anime:**
- ✅ Búsqueda y filtrado
- ✅ Integración API Jikan
- ✅ Caché inteligente
- ✅ Filtrado de hentai
- ✅ Detalles de anime

**Manga:**
- ✅ Listado y búsqueda
- ✅ Detalles
- ✅ Categorización

**Juegos:**
- ✅ Catálogo de juegos
- ✅ Búsqueda
- ✅ Detalles

**Música:**
- ✅ Catálogo musical
- ✅ Búsqueda
- ✅ Recomendaciones

### 👤 Gestión de Perfiles

- ✅ Crear perfil al registrarse
- ✅ Ver perfil propio
- ✅ Ver perfiles públicos de otros usuarios
- ✅ Editar perfil
- ✅ Avatar y banner personalizables
- ✅ Bio y descripción
- ✅ Sistema de temas (colores)
- ✅ Insignias y badges

### 📖 Biblioteca Personal

- ✅ Agregar a favorites
- ✅ Agregar a "ver después"
- ✅ Agregar a completados
- ✅ Ver biblioteca organizada
- ✅ Quitar de listas
- ✅ Múltiples medios (anime, manga, games, music)

### 👥 Sistema Social

- ✅ Seguir a otros usuarios
- ✅ Dejar de seguir
- ✅ Ver seguidores
- ✅ Ver a quién sigo
- ✅ Crear posts
- ✅ Likes en posts
- ✅ Ver posts de comunidad

### 💬 Interacción

- ✅ Like/Unlike en anime
- ✅ Like/Unlike en posts
- ✅ Comentarios en posts
- ✅ Recuentos en tiempo real

### 📁 Carga de Archivos

- ✅ Avatar de perfil
- ✅ Banner de perfil
- ✅ Imágenes en posts
- ✅ Validación de tipo MIME
- ✅ Límite de tamaño

### 🎨 Interfaz de Usuario

- ✅ Diseño responsivo
- ✅ Tema oscuro
- ✅ Sidebar de navegación
- ✅ Topbar con usuario
- ✅ Pixel art styling
- ✅ Cards para contenido
- ✅ Paginación
- ✅ Filtros avanzados

---

## 📂 Estructura de Carpetas Completa

```
sugoiapp/
├── package.json                           # Scripts root (dev concurrente)
├── README.md                              # Documentación general
├── TFG_DOCUMENTACION_COMPLETA.md          # Este archivo
│
└── sugoiHub/
    ├── package.json
    ├── render.yaml                        # Config para Render deployment
    ├── README_RENDER.md
    │
    ├── backend/
    │   ├── index.js                       # Entry point
    │   ├── db.js                          # Pool PostgreSQL
    │   ├── package.json
    │   ├── package-lock.json
    │   │
    │   ├── middleware/
    │   │   └── auth.js                    # Middleware JWT
    │   │
    │   ├── api/
    │   │   ├── profile.js                 # Rutas perfil (legacy)
    │   │   ├── auth/
    │   │   │   └── index.js               # Login, register, /me
    │   │   ├── anime/
    │   │   │   └── index.js               # Anime CRUD + caché
    │   │   ├── manga/
    │   │   │   └── index.js               # Manga CRUD
    │   │   ├── games/
    │   │   │   └── index.js               # Games CRUD
    │   │   ├── music/
    │   │   │   └── index.js               # Music CRUD
    │   │   ├── media/
    │   │   │   └── index.js               # Detalles media
    │   │   ├── library/
    │   │   │   └── index.js               # Biblioteca CRUD
    │   │   ├── posts/
    │   │   │   └── index.js               # Posts CRUD
    │   │   └── profile/
    │   │       └── index.js               # Profile CRUD
    │   │
    │   ├── migrations/
    │   │   └── create_followers_table.sql # SQL para followers
    │   │
    │   ├── uploads/
    │   │   ├── posts/
    │   │   │   └── 2/                     # Posts de user 2
    │   │   └── profiles/
    │   │       └── 2/                     # Avatar/banner user 2
    │   │
    │   ├── check-posts.js                 # Script verificar posts
    │   ├── create-media-tables.js         # Script crear tablas
    │   ├── expand-activity.js             # Script actividad
    │   ├── gen-hash.js                    # Generador hashes
    │   ├── reset-posts-table.js           # Reset posts
    │   ├── seed-media-likes.js            # Seed de likes
    │   ├── seed-test-data.js              # Seed datos prueba
    │   └── README.md                      # Docs backend
    │
    └── frontend/
        ├── index.html                     # Punto de entrada HTML
        ├── vite.config.ts                 # Config Vite
        ├── tsconfig.json                  # Config TypeScript
        ├── tsconfig.app.json
        ├── tsconfig.node.json
        ├── eslint.config.js               # Config ESLint
        ├── tailwind.config.cjs            # Config Tailwind
        ├── package.json
        ├── package-lock.json
        │
        ├── public/
        │   └── assets/                    # Assets estáticos
        │
        └── src/
            ├── main.tsx                   # Entry React
            ├── App.tsx                    # Enrutamiento
            ├── App.css
            ├── index.css                  # Estilos globales
            ├── types.ts                   # Tipos TypeScript
            ├── theme.ts                   # Config tema
            │
            ├── components/
            │   ├── TestConn.tsx           # Prueba conexión
            │   │
            │   ├── allPages/
            │   │   ├── Logo.tsx
            │   │   ├── Sidebar.tsx
            │   │   ├── Topbar.tsx
            │   │   ├── UserMenu.tsx
            │   │   ├── MainCard.tsx
            │   │   └── WikiSection.tsx
            │   │
            │   ├── pages/
            │   │   ├── HomePage.tsx
            │   │   ├── AnimePage.tsx
            │   │   ├── MangaPage.tsx
            │   │   ├── GamesPage.tsx
            │   │   ├── MusicPage.tsx
            │   │   ├── DiscoverPage.tsx
            │   │   ├── CommunityPage.tsx
            │   │   ├── MediaDetailPage.tsx
            │   │   ├── ProfilePage.tsx
            │   │   ├── ProfilePageNew.tsx
            │   │   ├── ProfileEditPage.tsx
            │   │   ├── PublicProfilePage.tsx
            │   │   ├── LoginPage.tsx
            │   │   └── RegisterPage.tsx
            │   │
            │   ├── homeComponents/
            │   │   ├── ProfileCard.tsx
            │   │   └── RecommendationCard.tsx
            │   │
            │   ├── games/
            │   │   └── GameCard.tsx
            │   ├── manga/
            │   │   └── MangaCard.tsx
            │   ├── music/
            │   │   └── MusicCard.tsx
            │   │
            │   ├── pixel/
            │   │   └── PixelIcons.tsx
            │   │
            │   └── ui/
            │       ├── Button.tsx
            │       ├── LikeButton.tsx
            │       └── README.md
            │
            ├── context/
            │   ├── AuthContext.tsx
            │   ├── LikesContext.tsx
            │   └── ToastContext.tsx
            │
            ├── layouts/
            │   └── MainLayout.tsx
            │
            ├── lib/
            │   ├── apiBase.ts
            │   ├── library.ts
            │   ├── useLike.ts
            │   └── ...
            │
            ├── notes/
            │   ├── NAVEGACION.md
            │   └── SESION_VOLATIL_Y_JWT.md
            │
            ├── pages/
            │   └── Dashboard.tsx
            │
            └── assets/
```

---

## 🚀 Próximos Pasos y Mejoras

### Corto Plazo (v0.2.0):

1. **Documentación API (OpenAPI/Swagger)**
   - Generar documentación automática de endpoints
   - Swagger UI para testing interactivo

2. **Tests**
   - Tests unitarios (Jest)
   - Tests de integración
   - Tests E2E (Cypress/Playwright)
   - Coverage > 80%

3. **Mejorar Performance**
   - Lazy loading de componentes
   - Optimización de imágenes
   - Code splitting en Vite
   - Compresión de datos

4. **Validaciones Mejoradas**
   - Validar datos en frontend y backend
   - Feedback visual de errores
   - Rate limiting en API

### Mediano Plazo (v0.3.0):

1. **Más Integraciones**
   - MyAnimeList API
   - TMDB (películas)
   - Spotify API (música)
   - IGDb (juegos)

2. **Características Sociales**
   - Sistema de comentarios en posts
   - Notificaciones en tiempo real (WebSockets)
   - Mensajes directos
   - Reacciones con emojis

3. **Sistema de Recomendaciones**
   - Algoritmo de recomendación
   - Análisis de preferencias
   - Sugerencias personalizadas

4. **Admin Panel**
   - Dashboard administrativo
   - Gestión de usuarios
   - Moderación de posts
   - Analytics

### Largo Plazo (v1.0.0):

1. **Mobile App**
   - React Native o Flutter
   - App nativa para iOS/Android

2. **Streaming Integration**
   - Integración con plataformas de streaming
   - Donde ver cada contenido

3. **Community Features Avanzadas**
   - Foros por tema
   - Clubs y grupos
   - Eventos y competiciones

4. **Marketplace**
   - Venta de merchandise
   - Crowdfunding para proyectos

5. **Machine Learning**
   - Clasificación automática de contenido
   - Análisis de sentimientos
   - Predicción de tendencias

### Técnico:

- ✓ CI/CD Pipeline (GitHub Actions)
- ✓ Docker containerization
- ✓ Kubernetes deployment
- ✓ Monitoring y logging (Sentry, LogRocket)
- ✓ Caching estratégico (Redis)
- ✓ CDN para assets estáticos
- ✓ Db replication y backups
- ✓ Load balancing

---

## 📊 Métricas y KPIs a Monitorear

- Tiempo de carga (< 2s)
- Uptime (> 99.9%)
- Usuarios activos mensuales (MAU)
- Engagement rate
- Tasa de retención
- API response time (< 200ms)
- Error rate (< 0.1%)
- Conversion rate (register/users)

---

## 📚 Referencias y Documentación

### Documentación Oficial:
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

### APIs Externas:
- [Jikan API (Anime/Manga)](https://jikan.moe/)

### Herramientas:
- [Render.com - Hosting](https://render.com/)
- [Postman - API Testing](https://www.postman.com/)
- [DBeaver - DB Management](https://dbeaver.io/)

---

## 📝 Notas Importantes para el TFG

### Aspectos a Destacar:

1. **Arquitectura Full-Stack Moderna:**
   - Frontend con React/TypeScript/Vite (herramientas modernas)
   - Backend con Node.js/Express (escalable y mantenible)
   - Base de datos PostgreSQL (robusta y relacional)

2. **Seguridad:**
   - Autenticación JWT segura
   - Contraseñas hasheadas con bcrypt
   - Validación de entrada
   - CORS configurado
   - SQL injection prevention (prepared statements)

3. **Escalabilidad:**
   - Diseño modular y componible
   - Caché inteligente
   - Índices en BD para performance
   - API RESTful bien diseñada

4. **Experiencia de Usuario:**
   - Interfaz responsiva
   - Temas personalizables
   - Smooth animations
   - Error handling amigable

5. **Prácticas Modernas:**
   - TypeScript para type safety
   - Context API para state management
   - Components reutilizables
   - ESLint para code quality
   - Vite para build ultra-rápido

---

## 👤 Información del Autor

**Autor:** andaa  
**Proyecto:** sugoiapp - TFG  
**GitHub:** [imjustDreea/sugoiapp](https://github.com/imjustDreea/sugoiapp)  
**Email:** [Tu email]  
**Fecha de Creación:** Enero 2026  

---

**Última actualización:** 22 de enero de 2026

---

Este documento debe usarse como referencia completa para entender, desarrollar y documentar el proyecto sugoiapp para el TFG.
