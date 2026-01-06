import { createContext, useState, useEffect, useRef, type ReactNode } from 'react';

type User = {
  id: number;
  username: string;
  name: string;
  last_name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, name: string, last_name: string, email: string, password: string, birth?: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  // Cargar sesión al montar
  useEffect(() => {
    // En React StrictMode (dev) este efecto puede ejecutarse 2 veces.
    // Evitamos doble inicialización para no provocar estados inconsistentes.
    if (didInit.current) return;
    didInit.current = true;

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 401 || res.status === 403) {
        // Token inválido/expirado: cerrar sesión.
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } else {
        // Fallo temporal (p.ej. 5xx): no “volatilizar” la sesión.
        // Dejamos el token para reintentar más tarde.
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      // Error de red/servidor: no borrar token; evita logout por fallos transitorios.
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en login');
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, name: string, last_name: string, email: string, password: string, birth?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, last_name, email, password, birth })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en registro');
      
      // Auto-login después de registrarse
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
