
const { createClient } = require('@supabase/supabase-js');

// Usar la URL fija del proyecto y la SERVICE_ROLE key desde .env
const supabaseUrl = process.env.SUPABASE_URL || 'https://ynqpqptqluhpljuvrfas.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.warn('Supabase: missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment. Check backend/.env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };