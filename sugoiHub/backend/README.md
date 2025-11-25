# Sugoi backend (Node + Supabase)

Este pequeño servidor Express proporciona un endpoint de ejemplo que consulta Supabase.

Pasos rápidos:

1. Copia `.env.example` a `.env` y rellena las variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
PORT=4000
```

2. Instala dependencias y arranca el servidor (desde la carpeta `backend`):

```powershell
cd backend
npm install
npm run dev   # o npm start
```

3. Prueba el endpoint:

```powershell
Invoke-RestMethod http://localhost:4000/users
# o con curl
curl http://localhost:4000/users
```

Notas de seguridad:
- La `SUPABASE_SERVICE_KEY` es la "service_role" key y tiene permisos elevados. No la subas al repositorio.
- En producción, protege estos endpoints y usa autenticación adecuada.
