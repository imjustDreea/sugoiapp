# Sugoi Backend (Node + Neon)

Este servidor Express proporciona la API REST para sugoiapp, conectándose a una base de datos PostgreSQL serverless en Neon.

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

```env
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
NODE_ENV=development
PORT=3000
```

**Importante:**
- `DATABASE_URL`: Obtén esta URL de conexión desde tu dashboard de Neon
- `JWT_SECRET`: Genera una clave aleatoria segura para firmar tokens JWT
- No subas el archivo `.env` al repositorio (ya está en `.gitignore`)

### 2. Instalar dependencias

```powershell
cd sugoiHub\backend
npm install
```

### 3. Iniciar el servidor

```powershell
npm run dev   # Modo desarrollo con hot-reload
# o
npm start     # Modo producción
```

El servidor estará disponible en `http://localhost:3000`

## 🧪 Probar la conexión

```powershell
# Verificar que el servidor está corriendo
Invoke-RestMethod http://localhost:3000/api

# Probar conexión a la base de datos
Invoke-RestMethod http://localhost:3000/api/db-test

# Obtener usuarios (requiere autenticación)
Invoke-RestMethod http://localhost:3000/api/users
```

## 📁 Estructura

```
backend/
├── api/
│   ├── anime/        # Endpoints de anime (Jikan API)
│   ├── auth/         # Autenticación y registro
│   ├── library/      # Biblioteca personal del usuario
│   ├── manga/        # Endpoints de manga
│   ├── posts/        # Sistema de posts
│   └── profile/      # Gestión de perfiles
├── middleware/
│   └── auth.js       # Middleware de autenticación JWT
├── db.js             # Configuración de Neon PostgreSQL
├── index.js          # Entry point del servidor
└── .env              # Variables de entorno (no incluido en git)
```

## 🔐 Seguridad

- Las contraseñas se hashean con `bcrypt` (10 rounds)
- Autenticación basada en JWT (válido 7 días)
- Conexión SSL/TLS con Neon
- Variables sensibles en `.env` (nunca en el código)
- En producción, usa HTTPS y configura CORS adecuadamente

## 🗄️ Base de Datos

El backend crea automáticamente las tablas necesarias al iniciar:
- `users` - Usuarios registrados
- `profile` - Perfiles extendidos
- `library_items` - Biblioteca multimedia
- `posts` - Sistema de publicaciones
- `followers` - Red social
- `media_likes` - Likes en contenido

## 📝 Scripts disponibles

```powershell
npm run dev          # Desarrollo (nodemon)
npm start            # Producción
node seed-test-data.js  # Poblar con datos de prueba
```