import { useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  name: string;
  lastname: string;
  email: string;
  birth: string | null;
  create_date: string | null;
};

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/users', { signal: controller.signal });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || 'No se pudieron cargar los usuarios');
        }
        setUsers(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, []);

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Home</h2>
        <p className="text-sm text-muted mt-1">Bienvenido a SugoiHub — tu tablero personal con recomendaciones y atajos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-darkCard rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-white">Your Feed</h3>
          <p className="text-sm text-muted mt-2">Aquí aparecerán actualizaciones de tus autores y juegos favoritos.</p>
        </div>

        <div className="bg-darkCard rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-white">Recommendations</h3>
          <p className="text-sm text-muted mt-2">Basado en tus lecturas y partidas.</p>
        </div>
      </div>

      <div className="bg-darkCard rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Usuarios (Neon DB)</h3>
            <p className="text-sm text-muted">Listado rápido desde public.users (sin contraseña).</p>
          </div>
          {loading && <span className="text-sm text-muted">Cargando...</span>}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {users.length === 0 && !loading ? (
          <p className="text-sm text-muted">No hay usuarios.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-sm text-muted border-b border-gray-800">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Usuario</th>
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Apellido</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Nacimiento</th>
                  <th className="py-2 pr-4">Creado</th>
                </tr>
              </thead>
              <tbody className="text-sm text-white">
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800/60">
                    <td className="py-2 pr-4">{user.id}</td>
                    <td className="py-2 pr-4">{user.username}</td>
                    <td className="py-2 pr-4">{user.name}</td>
                    <td className="py-2 pr-4">{user.lastname}</td>
                    <td className="py-2 pr-4">{user.email}</td>
                    <td className="py-2 pr-4">{user.birth ? new Date(user.birth).toLocaleDateString() : '-'}</td>
                    <td className="py-2 pr-4">{user.create_date ? new Date(user.create_date).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
