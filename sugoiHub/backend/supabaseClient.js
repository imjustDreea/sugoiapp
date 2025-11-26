// Re-exportador del cliente Supabase (mantener compatibilidad con el archivo existente)
require('dotenv').config();
const { supabase } = require('./supabase');

module.exports = { supabase };
