# Despliegue en Render

Este repositorio contiene un frontend basado en Vite (carpeta `frontend`) y un backend Node/Express (carpeta `backend`). El fichero `render.yaml` en la raíz está preparado para crear dos servicios en Render:

- Un Static Site para el frontend (construye `frontend` y publica `frontend/dist`).
- Un Web Service para el backend (instala dependencias en `backend` y ejecuta `npm start`).

Instrucciones rápidas:

1) En Render, crea un nuevo Web Service y un Static Site usando este repositorio (conectar GitHub/GitLab/Bitbucket). Puedes usar el `render.yaml` para crear ambos automáticamente si tu cuenta tiene acceso a la creación por archivo.

2) Opciones principales (si configuras manualmente desde la UI):

  - Frontend (Static Site)
    - Build Command: cd frontend && npm ci && npm run build
    - Publish directory: frontend/dist
    - Branch: main

  - Backend (Web Service)
    - Environment: Node
    - Build Command: cd backend && npm ci
    - Start Command: cd backend && npm start
    - Plan: free (o el que prefieras)

3) Variables de entorno:
   - Si tu backend necesita variables (por ejemplo, supabase URL/KEY), configúralas en la sección de Environment del servicio en Render.

Notas importantes:
- El frontend debe generar la carpeta `frontend/dist` tras `npm run build` (Vite por defecto la coloca ahí). Actualmente el script de `frontend/package.json` ejecuta `tsc -b && vite build` — esto está bien siempre que la compilación de TypeScript termine correctamente.
- El backend debe exponer las rutas/API necesarias y (opcionalmente) servir los archivos estáticos si quieres un único servicio que los entregue. En este repo actual hay una carpeta `backend` con `index.js` y `package.json` con `start: node index.js`.

Comandos locales para probar antes de desplegar:

  # Instala dependencias del frontend
  cd frontend
  npm ci
  npm run build

  # Instala y lanza el backend (local)
  cd ../backend
  npm ci
  npm start

Con esto, Render podrá ejecutar los builds y exponer el frontend y backend sin necesitar mover carpetas.
