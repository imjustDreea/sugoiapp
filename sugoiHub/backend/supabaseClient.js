// Centraliza la creación del cliente Supabase y exporta `supabase`.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_ANON_KEY;

// Preferir la SERVICE_ROLE key en entorno de servidor; si no existe, usar anon key.
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
	console.warn('Supabase client: missing SUPABASE_URL or key. Check backend/.env');
}

let supabase = null;
try {
	if (supabaseUrl && supabaseKey) {
		supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
	}
} catch (e) {
	console.error('Failed to create Supabase client:', e);
	supabase = null;
}

module.exports = { supabase };
