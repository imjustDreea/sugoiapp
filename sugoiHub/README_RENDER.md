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

