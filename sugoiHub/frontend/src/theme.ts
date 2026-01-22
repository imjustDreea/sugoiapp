export type NeonTheme = {
  colorBg: string;
  accentViolet: string;
  accentLime: string;
  colorGrid: string;
};

export type ThemeKey = 'neon-noir' | 'retro-ocean' | 'soft-neon';

export const THEME_PRESETS: Record<ThemeKey, NeonTheme> = {
  'neon-noir': {
    colorBg: '#0D0D0D',
    accentViolet: '#A855F7',
    accentLime: '#BFFF00',
    colorGrid: '#2D2D2D'
  },
  'retro-ocean': {
    colorBg: '#1A2332',
    accentViolet: '#60A5FA',
    accentLime: '#34D399',
    colorGrid: '#2D3F5F'
  },
  'soft-neon': {
    colorBg: '#1A1425',
    accentViolet: '#E879F9',
    accentLime: '#5EEAD4',
    colorGrid: '#2D2438'
  }
};

export function applyTheme(theme: Partial<NeonTheme>) {
  const root = document.documentElement;
  if (theme.colorBg) root.style.setProperty('--color-bg', theme.colorBg);
  if (theme.accentViolet) root.style.setProperty('--accent-violet', theme.accentViolet);
  if (theme.accentLime) root.style.setProperty('--accent-lime', theme.accentLime);
  if (theme.colorGrid) root.style.setProperty('--color-grid', theme.colorGrid);
}

export function saveThemeToLocalStorage(theme: Partial<NeonTheme>) {
  localStorage.setItem('neonTheme', JSON.stringify(theme));
}

export function loadThemeFromLocalStorage(): Partial<NeonTheme> | null {
  try {
    const raw = localStorage.getItem('neonTheme');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<NeonTheme>;
  } catch {
    return null;
  }
}
