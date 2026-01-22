import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Logo from '../allPages/Logo';
import {
  PixelCalendarIcon,
  PixelEyeIcon,
  PixelEyeOffIcon,
  PixelLockIcon,
  PixelMailIcon,
  PixelUserIcon,
} from '../pixel/PixelIcons';

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
    <div className="pixel-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl pixel-window">
        <div className="pixel-window-header px-4 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="xs" />
            <div className="min-w-0">
              <div className="pixel-window-title">SUGOIHUB</div>
              <div className="pixel-field-label">REGISTER</div>
            </div>
          </div>
          <div className="pixel-badge">NEW PLAYER</div>
        </div>

        <div className="px-5 py-6">
          {error && <div className="pixel-alert mb-5">ERROR: {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="pixel-field-label">USUARIO</label>
              <div className="pixel-field-row">
                <div className="pixel-icon-slot" aria-hidden="true">
                  <PixelUserIcon size={22} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pixel-input"
                  placeholder="Usuario"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="pixel-field-label">NOMBRE</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pixel-input"
                  placeholder="Juan"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="pixel-field-label">APELLIDO</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="pixel-input"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="pixel-field-label">EMAIL</label>
              <div className="pixel-field-row">
                <div className="pixel-icon-slot" aria-hidden="true">
                  <PixelMailIcon size={22} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pixel-input"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="pixel-field-label">NACIMIENTO</label>
              <div className="pixel-field-row">
                <div className="pixel-icon-slot" aria-hidden="true">
                  <PixelCalendarIcon size={22} />
                </div>
                <input
                  type="date"
                  name="birth"
                  value={formData.birth}
                  onChange={handleChange}
                  className="pixel-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="pixel-field-label">CONTRASEÑA</label>

                  <div className="relative group">
                    <button
                      type="button"
                      className="w-6 h-6 border-2 border-white/80 bg-black/60 rounded-sm text-xs font-black leading-none flex items-center justify-center"
                      aria-label="Ver requisitos de contraseña"
                    >
                      i
                    </button>

                    <div className="hidden group-hover:block group-focus-within:block absolute left-0 top-7 z-10 w-64">
                      <div
                        className="bg-black/80 border-2 border-white/80 rounded-sm p-3"
                        style={{ imageRendering: 'pixelated' }}
                        role="tooltip"
                      >
                        <div className="pixel-field-label mb-2 text-accentLime">REQUISITOS</div>
                        <ul className="text-xs space-y-1">
                          <li className={passwordCriteria.length ? 'text-accentLime font-black' : 'text-accentLime font-black opacity-70'}>
                            • Mínimo 8 caracteres
                          </li>
                          <li className={passwordCriteria.uppercase ? 'text-accentLime font-black' : 'text-accentLime font-black opacity-70'}>
                            • 1 mayúscula
                          </li>
                          <li className={passwordCriteria.lowercase ? 'text-accentLime font-black' : 'text-accentLime font-black opacity-70'}>
                            • 1 minúscula
                          </li>
                          <li className={passwordCriteria.number ? 'text-accentLime font-black' : 'text-accentLime font-black opacity-70'}>
                            • 1 número
                          </li>
                          <li className={passwordCriteria.special ? 'text-accentLime font-black' : 'text-accentLime font-black opacity-70'}>
                            • 1 carácter especial
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pixel-field-row">
                  <div className="pixel-icon-slot" aria-hidden="true">
                    <PixelLockIcon size={22} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pixel-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="pixel-icon-button"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <PixelEyeOffIcon size={22} /> : <PixelEyeIcon size={22} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="pixel-field-label">CONFIRMAR</label>
                  <div className="w-6 h-6" />
                </div>
                <div className="pixel-field-row">
                  <div className="pixel-icon-slot" aria-hidden="true">
                    <PixelLockIcon size={22} />
                  </div>
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="pixel-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((v) => !v)}
                    className="pixel-icon-button"
                    aria-label={showPasswordConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {showPasswordConfirm ? <PixelEyeOffIcon size={22} /> : <PixelEyeIcon size={22} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Medidor estilo pixel con segmentos Weak/Medium/Strong */}
            {formData.password && (
              <div
                className="space-y-2 animate-fadeIn bg-black/60 border-2 border-white/80 rounded-sm p-3"
                style={{ imageRendering: 'pixelated' }}
              >
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
                  <span className="text-red-500 font-black text-xs">DÉBIL</span>
                  <span className="text-yellow-400 font-black text-xs">MEDIA</span>
                  <span className="text-green-500 font-black text-xs">FUERTE</span>
                </div>
              </div>
            )}

            <button type="submit" disabled={auth.loading} className="pixel-btn pixel-btn-primary pixel-btn-full mt-2">
              {auth.loading ? 'CARGANDO...' : 'REGISTRARSE'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-grid">
            <p className="pixel-field-label text-center mb-4">¿YA TIENES CUENTA?</p>
            <button type="button" onClick={() => navigate('/login')} className="pixel-btn pixel-btn-secondary pixel-btn-full">
              INICIAR SESIÓN
            </button>
          </div>

          <p className="pixel-field-label text-center mt-6">Al registrarte aceptas términos y privacidad.</p>
        </div>
      </div>
    </div>
  );
}
