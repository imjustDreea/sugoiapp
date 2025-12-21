import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import Logo from '../allPages/Logo';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-x-hidden flex items-center justify-center py-12">
      {/* Fondo con efecto aurora */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>

      {/* Grilla sutil */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Branding & Message */}
          <div className="hidden lg:flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <Logo size="sm" showText />
              </div>

              <h2 className="text-4xl font-bold text-white mb-4 leading-snug pb-1">Bienvenido de vuelta</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 pb-1">
                Accede a tu portal otaku. Anime, manga, juegos y conexiones que te esperan.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-white font-semibold leading-relaxed pb-0.5">Historial Sincronizado</p>
                    <p className="text-gray-400 text-sm leading-relaxed pb-0.5">Recupera donde lo dejaste</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-white font-semibold leading-relaxed pb-0.5">Comunidad Activa</p>
                    <p className="text-gray-400 text-sm leading-relaxed pb-0.5">Conecta con otros otakus</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-white font-semibold leading-relaxed pb-0.5">Seguridad Premium</p>
                    <p className="text-gray-400 text-sm leading-relaxed pb-0.5">Tus datos protegidos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative anime element */}
            <div className="relative h-40 opacity-60">
              <div className="absolute bottom-0 right-0 text-6xl">✨</div>
              <div className="absolute bottom-10 right-20 text-5xl">🎌</div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="relative">
                {/* Glow border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-purple-500 to-purple-600 rounded-2xl opacity-30 blur group-hover:opacity-100 transition duration-1000"></div>
                
                {/* Card */}
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-green-300 to-purple-400 bg-clip-text mb-2" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.75rem' }}>INICIAR SESIÓN</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-green-400 to-purple-500 rounded-full"></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                        <span className="text-red-500 mt-0.5">!</span>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="group">
                      <label className="block text-xs font-semibold text-green-300 mb-3 uppercase tracking-wide">Email o Usuario</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-green-400/50" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                          placeholder="usuario@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-green-300 mb-3 uppercase tracking-wide">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-green-400/50" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={auth.loading}
                      className="w-full mt-8 py-2.5 font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg transition-all duration-300 shadow-lg shadow-purple-600/50 hover:shadow-purple-500/75 disabled:opacity-50 disabled:shadow-none uppercase tracking-wide text-sm"
                    >
                      {auth.loading ? '⚡ VERIFICANDO...' : '⚡ ENTRAR'}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-purple-500/20">
                    <p className="text-center text-gray-400 text-sm mb-4">¿Nuevo en SugoiHub?</p>
                    <button 
                      onClick={() => navigate('/register')} 
                      className="w-full py-2.5 font-semibold text-purple-300 border border-purple-400/50 rounded-lg hover:bg-purple-500/10 transition-colors text-sm uppercase tracking-wide"
                    >
                      CREAR CUENTA →
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-500 text-xs mt-6">
                Al iniciar sesión, aceptas nuestros términos y privacidad
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
}
