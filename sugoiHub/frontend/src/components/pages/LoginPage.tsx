import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Logo from '../allPages/Logo';
import { PixelLockIcon, PixelMailIcon } from '../pixel/PixelIcons';

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!auth) return <div>Error: Auth context not available</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await auth.login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="pixel-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg pixel-window">
        <div className="pixel-window-header px-4 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="xs" />
            <div className="min-w-0">
              <div className="pixel-window-title">SUGOIHUB</div>
              <div className="pixel-field-label">LOGIN</div>
            </div>
          </div>
          <div className="pixel-badge">PRESS START</div>
        </div>

        <div className="px-5 py-6">
          {error && (
            <div className="pixel-alert mb-5">
              ERROR: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="pixel-field-label">EMAIL O USUARIO</label>
              <div className="pixel-field-row">
                <div className="pixel-icon-slot" aria-hidden="true">
                  <PixelMailIcon size={22} />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pixel-input"
                  placeholder="usuario@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="pixel-field-label">CONTRASEÑA</label>
              <div className="pixel-field-row">
                <div className="pixel-icon-slot" aria-hidden="true">
                  <PixelLockIcon size={22} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pixel-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={auth.loading} className="pixel-btn">
              {auth.loading ? 'CARGANDO...' : 'ENTRAR'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="pixel-btn pixel-btn-secondary"
            >
              CREAR CUENTA
            </button>
          </form>

          <div className="mt-6 pixel-field-label text-center">
            Al iniciar sesión aceptas términos y privacidad.
          </div>
        </div>
      </div>
    </div>
  );
}
