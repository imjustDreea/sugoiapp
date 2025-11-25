Pasos para solucionar reinicios en bucle de Vite

1) Por qué ocurre
- Vite reinicia automáticamente cuando detecta cambios en archivos de entorno (`.env`). Si algún proceso o editor toca ese archivo repetidamente, Vite entrará en un bucle de reinicios.

2) Qué se ha cambiado en este repo
- `vite.config.ts` se ha actualizado para que el servidor ignore cambios en `**/.env`, `**/.env.*` y `**/.ENV`.

3) Pasos recomendados (ejecutar en PowerShell)

- Primero, mata procesos node que puedan quedarse en segundo plano:
  ```powershell
  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
  ```

- Limpia la cache de Vite y reinstala dependencias si es necesario:
  ```powershell
  rd /s /q node_modules\.vite
  npm install
  ```

- Arranca backend (en una terminal):
  ```powershell
  cd backend
  npm install
  npm run dev
  ```

- Arranca frontend (en otra terminal):
  ```powershell
  cd frontend
  npm install
  npm run dev
  ```

4) Si el problema continúa
- Revisa si algún editor o extensión está escribiendo `.env` constantemente (auto-save, sincronización en la nube, LSP). Intenta deshabilitar auto-save temporalmente.
- Como medida extra puedes renombrar `frontend/.ENV` a `frontend/.env.example` (no rastreado por Vite) y crear un `.env` manual cuando sea necesario.
