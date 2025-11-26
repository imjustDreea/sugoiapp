// Script de diagnóstico para verificar conexión y resultados desde el cliente Supabase
const { supabase } = require('./supabase');

(async function() {
  try {
    console.log('SUPABASE_URL=', process.env.SUPABASE_URL);
    console.log('SUPABASE_SERVICE_KEY present=', !!process.env.SUPABASE_SERVICE_KEY);

    console.log('\n-- Running select * from public.users --');
    const resp = await supabase.from('users').select('*');
    console.log('select response:');
    console.log(JSON.stringify(resp, null, 2));

    console.log('\n-- Running head/count for users --');
    const countResp = await supabase.from('users').select('*', { head: true, count: 'exact' });
    console.log('count response:');
    console.log(JSON.stringify(countResp, null, 2));

    // Además, realizar una petición HTTP directa a la REST API para ver la respuesta raw
    try {
      console.log('\n-- Direct REST fetch to /rest/v1/users --');
      const restUrl = `${url.replace(/\/$/, '')}/rest/v1/users?select=*`;
      const headers = {
        apikey: key || '',
        Authorization: key ? `Bearer ${key}` : '',
        Accept: 'application/json'
      };

      // node 18+ tiene fetch integrado
      const restResp = await fetch(restUrl, { method: 'GET', headers });
      const restText = await restResp.text();
      console.log('REST status:', restResp.status, restResp.statusText);
      // Intenta parsear JSON, si no es JSON, imprimir texto
      try {
        console.log('REST body (parsed):', JSON.stringify(JSON.parse(restText), null, 2));
      } catch (e) {
        console.log('REST body (raw):', restText.slice(0, 2000));
      }
    } catch (e) {
      console.error('Error doing direct REST fetch:', e);
    }

  } catch (e) {
    console.error('Unexpected error in test-supabase:', e);
    process.exit(1);
  }
})();
