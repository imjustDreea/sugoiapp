const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { supabase } = require('./supabase');

const app = express();
app.use(cors());
app.use(express.json());

// Logging de entorno (no mostrar keys completas)
console.log('Backend starting. PORT=', process.env.PORT || 4000);
console.log('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY present:', !!process.env.SUPABASE_SERVICE_KEY);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Sugoi backend running' });
});

// Endpoint de ejemplo: devuelve filas de la tabla `users` (ajusta el nombre si usas otra tabla)
app.get('/users', async (req, res) => {
  try {
    // Fallback: si no hay service key, devolver datos mock para desarrollo
    if (!process.env.SUPABASE_SERVICE_KEY) {
      console.warn('SUPABASE_SERVICE_KEY missing — returning mock users for development');
      const mock = [
        { id: '00000000-0000-0000-0000-000000000001', email: 'ana@example.com', full_name: 'Ana Pérez', created_at: new Date().toISOString() },
        { id: '00000000-0000-0000-0000-000000000002', email: 'juan@example.com', full_name: 'Juan López', created_at: new Date().toISOString() },
        { id: '00000000-0000-0000-0000-000000000003', email: 'marco@example.com', full_name: 'Marco Díaz', created_at: new Date().toISOString() }
      ];
      return res.json({ data: mock, mock: true });
    }

    const { data, error } = await supabase.from('users').select('*').limit(100);
    if (error) {
      console.error('Supabase query error:', error);
      // Si falla la consulta, devolver datos mock para seguir desarrollando
      const mock = [
        { id: '00000000-0000-0000-0000-000000000004', email: 'demo1@example.com', full_name: 'Demo Uno', created_at: new Date().toISOString() }
      ];
      return res.json({ data: mock, mock: true, supabaseError: error.message || error });
    }
    console.log('Supabase returned rows:', Array.isArray(data) ? data.length : 0);
    return res.json({ data });
  } catch (e) {
    console.error('Unexpected error in /users:', e);
    // En caso de excepción, devolver mock para no bloquear el frontend durante desarrollo
    const mock = [
      { id: '00000000-0000-0000-0000-000000000005', email: 'fallback@example.com', full_name: 'Fallback User', created_at: new Date().toISOString() }
    ];
    return res.json({ data: mock, mock: true, exception: String(e) });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Sugoi backend listening on ${port}`));
