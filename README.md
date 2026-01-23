# sugoiapp

Un proyecto full‑stack para explorar y recomendar contenido de anime, manga, juegos y música. Este repositorio contiene el frontend desarrollado con Vite + React + TypeScript y un backend en Node.js que integra servicios externos y gestión de datos.

**Estado:** En desarrollo

## 🚀 Tecnologías principales

- **Frontend:** Vite, React, TypeScript
- **Backend:** Node.js, Express
- **Base de datos:** Neon (PostgreSQL serverless)
- **APIs externas:** Jikan (API de MyAnimeList)
- **Estilos:** Tailwind CSS

## 📁 Estructura del proyecto

```
sugoiHub/
├── backend/              # Servidor y API
│   ├── api/             # Rutas (anime, manga)
│   ├── index.js         # Punto de entrada del servidor
│   ├── db.js            # Configuración de Neon
│   └── test_*.js        # Scripts de prueba
└── frontend/            # Aplicación cliente
    ├── src/             # Componentes, layouts y páginas
    ├── vite.config.ts   # Configuración de Vite
    └── tailwind.config.cjs
```

## ✨ Características

- Interfaz moderna para descubrir y recomendar anime, manga, juegos y música
- Integración con la API de Jikan para datos actualizados de anime y manga
- Base de datos PostgreSQL serverless con Neon
- Arquitectura modular preparada para futuras expansiones

## 🛠️ Instalación y desarrollo

### Requisitos previos
- Node.js v16 o superior
- npm o pnpm

### Configuración del backend

```powershell
cd sugoiHub\backend
npm install
npm run dev
```

### Configuración del frontend

```powershell
cd sugoiHub\frontend
npm install
npm run dev
```

## ⚙️ Variables de entorno

Crea un archivo `.env` en las carpetas `backend` y `frontend` con las siguientes variables:

### Backend
```env
DATABASE_URL=tu_connection_string_de_neon
PORT=3000
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
```

## 🧪 Pruebas

El proyecto incluye scripts de prueba para validar las integraciones:

```powershell
cd sugoiHub\backend
node test_fetch_jikan.js
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📋 Roadmap

- [ ] Documentación de la API con Swagger/OpenAPI
- [ ] Implementación de CI/CD
- [ ] Tests unitarios y de integración
- [ ] Sistema de recomendaciones personalizado
- [ ] Integración con más APIs de contenido

## 📝 Licencia

Este proyecto está bajo desarrollo personal.

## 👤 Autor

**imjustDreea**

---

Desarrollado con ❤️ para la comunidad otaku