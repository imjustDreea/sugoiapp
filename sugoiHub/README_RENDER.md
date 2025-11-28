# Despliegue en Render

Este repositorio contiene un frontend basado en Vite (carpeta `frontend`) y un backend Node/Express (carpeta `backend`).

Hemos configurado el proyecto para que el build del frontend se emita dentro de `backend/dist` y el backend sirva esos archivos estáticos con Express. Esto permite desplegar un único Web Service en Render que construye el frontend y arranca el backend.

Flujo que se recomienda en Render (ya reflejado en `render.yaml`):

- Render crea un único Web Service llamado `sugoiapp`.
- Build Command (ejecutado por Render):
  - cd backend && npm ci && npm run build
    - Esto entra en la carpeta `backend`, instala dependencias y ejecuta el script `build` del `backend/package.json`.
    - El `backend/package.json` está configurado para ejecutar el build del frontend: `cd ../frontend && npm install && npm run build`.
    - El build de Vite está configurado para emitir a `../backend/dist` (ver `frontend/vite.config.ts`).

- Start Command (ejecutado por Render después del build):
  - cd backend && npm start
    - Esto arranca `node index.js` — Express servirá los archivos estáticos en `backend/dist` y las rutas API.

Variables de entorno
- Configura en la UI de Render las variables necesarias, por ejemplo `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, etc. Asegúrate de añadirlas al servicio `sugoiapp`.

Comandos locales para probar el flujo completo

  # Desde la raíz del repo, construir frontend y backend manualmente
  cd sugoiHub/frontend
  npm ci
  npm run build

  # Verifica que los archivos fueron emitidos en backend/dist
  dir ..\backend\dist

  # Iniciar el backend localmente (servirá los archivos generados)
  cd ..\backend
  npm ci
  npm start

Con esto, Render solo necesita ejecutar el build del backend (ya configurado en `render.yaml`) y luego arrancar el backend para servir la aplicación completa.

Notas y recomendaciones
- Vite mostrará una advertencia cuando `outDir` apunte fuera del project root: "outDir ... is not inside project root and will not be emptied". Esto es informativo; si quieres que Vite borre el directorio antes de escribir, añade `emptyOutDir: true` en la sección `build` de `vite.config.ts` o usa la opción CLI `--emptyOutDir`.
- Si prefieres desplegar frontend y backend como servicios separados en Render (Static Site + Web Service), puedo revertir `render.yaml` a esa opción — actualmente hemos optado por un único servicio para simplificar el despliegue.

API y rutas (nota importante)
- El frontend ahora usa rutas relativas para llamar a la API por defecto. Eso significa que las llamadas del cliente irán a `/api/...` en el mismo origen donde se sirve la SPA (por ejemplo, https://sugoihub.onrender.com/api/...).
- Si quieres apuntar el frontend a otro backend durante pruebas, utiliza la variable de entorno `VITE_BACKEND_URL` al construir el frontend. Ejemplo:

  VITE_BACKEND_URL=https://mi-backend.example.com npm run build

  Si `VITE_BACKEND_URL` no está definida, la app usará rutas relativas.

Mejoras en el proxy a Jikan
- Se ha añadido un mecanismo sencillo de resiliencia en el backend para el proxy a Jikan:
  - Caché en memoria con TTL (por defecto 60s) para reducir la presión sobre la API de Jikan.
  - Reintentos con backoff (2 reintentos exponenciales) para casos temporales (timeouts/errores transitorios).

Esto reduce la probabilidad de errores 429/502 en producción. Aun así, si tu app hace muchas peticiones frecuentes a Jikan, considera añadir una cache persistente (Redis) o un límite más agresivo de llamadas desde el cliente.

