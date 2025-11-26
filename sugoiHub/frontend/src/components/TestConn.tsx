import React, { useEffect, useState } from 'react';

export default function TestConn() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) ?? 'http://localhost:4000';

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/users`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const json = await res.json();

      // backend devuelve { data } según index.js
      const data = json.data ?? json;
      setUsers(Array.isArray(data) ? data : null);
    } catch (e) {
      setError(e);
      setUsers(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preferir columnas específicas del schema `public.users` y ocultar password
  const preferredCols = ['id', 'username', 'email', 'birthday', 'created_at'];
  const detectedCols = users && users.length > 0 ? Object.keys(users[0]) : [];
  const columns = detectedCols.length > 0 ? detectedCols.filter(c => c !== 'password') : preferredCols.filter(() => false);


  return (
    <div className="mt-4 bg-darkCard rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-white">Usuarios (desde backend)</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{backendUrl}</span>
          <button
            className="text-sm px-3 py-1 rounded bg-primary/80 hover:bg-primary"
            onClick={() => fetchUsers()}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted mt-2">Cargando usuarios desde backend...</p>}

      {error && (
        <div className="mt-2">
          <p className="text-sm text-red-400">Error al consultar backend:</p>
          <pre className="text-xs bg-[#0b1220] p-2 rounded mt-1 overflow-auto">{typeof error === 'string' ? error : String(error)}</pre>
        </div>
      )}

      {!loading && !error && users && users.length > 0 && (
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} className="text-left pr-4 pb-2 text-muted">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-t border-gray-700">
                  {columns.map((col) => {
                    const val = (u as any)[col];
                    let display = '';
                    if (col === 'password') display = '••••••';
                    else if (col === 'birthday' || col === 'created_at') {
                      try {
                        display = val ? new Date(val).toLocaleDateString() : '';
                      } catch {
                        display = String(val ?? '');
                      }
                    } else {
                      display = String(val ?? '');
                    }

                    return (
                      <td key={col} className="pr-4 py-2 align-top">{display}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && users && users.length === 0 && (
        <p className="text-sm text-muted mt-2">No hay usuarios en la tabla.</p>
      )}
    </div>
  );
}
