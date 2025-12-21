import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, Calendar, Check, Eye, EyeOff } from 'lucide-react';
import Logo from '../allPages/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    birth: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  if (!auth) return <div>Error: Auth context not available</div>;

  // Validación de contraseña
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  }, [formData.password]);

  const passwordStrength = useMemo(() => {
    const criteria = Object.values(passwordCriteria);
    const met = criteria.filter(Boolean).length;
    return (met / criteria.length) * 100;
  }, [passwordCriteria]);

  const totalBlocks = 15;
  const filledBlocks = useMemo(() => Math.round((passwordStrength / 100) * totalBlocks), [passwordStrength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que la contraseña cumpla todos los criterios
    const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
    if (!allCriteriaMet) {
      setError('La contraseña debe cumplir todos los requisitos de seguridad');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const birthDate = new Date(formData.birth);
    const today = new Date();
    const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    if (isNaN(birthDate.getTime()) || birthDate > sixteenYearsAgo) {
      setError('Debes tener al menos 16 años');
      return;
    }

    try {
      await auth.register(
        formData.username,
        formData.name,
        formData.last_name,
        formData.email,
        formData.password,
        formData.birth
      );
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
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

              <h2 className="text-4xl font-bold text-white mb-4 leading-snug pb-1">Únete a la comunidad</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 pb-1">
                Crea tu perfil y descubre un universo de anime, manga, juegos y más. Conecta con otakus de todo el mundo.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-white font-semibold leading-relaxed pb-0.5">Personaliza tu Perfil</p>
                    <p className="text-gray-400 text-sm leading-relaxed pb-0.5">Muestra tu estilo otaku</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-white font-semibold leading-relaxed pb-0.5">Descubre Recomendaciones</p>
                    <p className="text-gray-400 text-sm leading-relaxed pb-0.5">IA personalizada para ti</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-white font-semibold leading-relaxed pb-0.5">Comunidad Vibrante</p>
                    <p className="text-gray-400 text-sm leading-relaxed pb-0.5">Chats y foros exclusivos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative anime element */}
            <div className="relative h-40 opacity-60">
              <div className="absolute bottom-0 right-0 text-6xl">✨</div>
              <div className="absolute bottom-10 right-20 text-5xl">🎮</div>
            </div>
          </div>

          {/* Right side - Register Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="relative">
                {/* Glow border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-purple-500 to-purple-600 rounded-2xl opacity-30 blur group-hover:opacity-100 transition duration-1000"></div>
                
                {/* Card */}
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-7 border border-purple-500/30 shadow-2xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-green-300 to-purple-400 bg-clip-text leading-normal pb-1 mb-2" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.75rem' }}>REGISTRO</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-green-400 to-purple-500 rounded-full"></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                        <span className="text-red-500 mt-0.5">!</span>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="group">
                      <label className="block text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide">Usuario</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-white/80" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full pl-9 pr-4 py-2 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                          placeholder="Usuario"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide">Nombre</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                          placeholder="Juan"
                          required
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide">Apellido</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                          placeholder="Pérez"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-white/80" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-9 pr-4 py-2 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide">Nacimiento</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-white/80" />
                        <input
                          type="date"
                          name="birth"
                          value={formData.birth}
                          onChange={handleChange}
                          className="w-full pl-9 pr-4 py-2 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide">Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-white/80" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-9 pr-11 py-2 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-2.5 text-white/70 hover:text-white transition"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-xs font-semibold text-green-300 mb-2 uppercase tracking-wide">Confirmar</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-white/80" />
                          <input
                            type={showPasswordConfirm ? 'text' : 'password'}
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            className="w-full pl-9 pr-11 py-2 bg-purple-900/30 border border-purple-400/30 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition backdrop-blur-sm"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirm((v) => !v)}
                            className="absolute right-3 top-2.5 text-white/70 hover:text-white transition"
                            aria-label={showPasswordConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                          >
                            {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Medidor estilo pixel con segmentos Weak/Medium/Strong */}
                    {formData.password && (
                      <div className="space-y-2 animate-fadeIn bg-black/60 border-2 border-white/80 rounded-sm p-3" style={{ imageRendering: 'pixelated' }}>
                        <div className="border-2 border-white rounded-sm p-2 bg-slate-900">
                          <div className="flex gap-1">
                            {Array.from({ length: totalBlocks }).map((_, i) => {
                              const isFilled = i < filledBlocks;
                              const inWeak = i < 5;
                              const inMedium = i >= 5 && i < 10;
                              const color = inWeak
                                ? (isFilled ? '#ef4444' : '#111827')
                                : inMedium
                                ? (isFilled ? '#f59e0b' : '#111827')
                                : (isFilled ? '#22c55e' : '#111827');
                              return (
                                <div
                                  key={i}
                                  style={{ width: 14, height: 14, background: color, border: '1px solid #374151' }}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex justify-between px-2">
                          <span className="text-red-500 font-black text-xs">WEAK</span>
                          <span className="text-yellow-400 font-black text-xs">MEDIUM</span>
                          <span className="text-green-500 font-black text-xs">STRONG</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={auth.loading}
                      className="w-full mt-6 py-2.5 font-bold text-white bg-linear-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg transition-all duration-300 shadow-lg shadow-purple-600/50 hover:shadow-purple-500/75 disabled:opacity-50 disabled:shadow-none uppercase tracking-wide text-sm"
                    >
                      {auth.loading ? '⚡ CREANDO CUENTA...' : '⚡ REGISTRARSE'}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-purple-500/20">
                    <p className="text-center text-gray-400 text-sm mb-4">¿Ya tienes cuenta?</p>
                    <button 
                      onClick={() => navigate('/login')} 
                      className="w-full py-2.5 font-semibold text-green-300 border border-green-400/50 rounded-lg hover:bg-green-500/10 transition-colors text-sm uppercase tracking-wide"
                    >
                      INICIAR SESIÓN →
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-500 text-xs mt-6">
                Al registrarte, aceptas nuestros términos y privacidad
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .register-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(168, 85, 247, 0.6) rgba(30, 27, 75, 0.3);
        }
        .register-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .register-scroll::-webkit-scrollbar-track {
          background: rgba(30, 27, 75, 0.35);
          border-radius: 9999px;
        }
        .register-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(74, 222, 128, 0.6), rgba(168, 85, 247, 0.7));
          border-radius: 9999px;
        }
        .register-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(74, 222, 128, 0.8), rgba(168, 85, 247, 0.9));
        }
      `}</style>
    </div>
  );
}
