// Configuración de la conexión a PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificar conexión
pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

module.exports = { pool };
