export type NeonTheme = {
  colorBg: string;
  accentViolet: string;
  accentLime: string;
  colorGrid: string;
};

export type ThemeKey = 'neon-noir' | 'retro-ocean' | 'soft-neon';

export const THEME_PRESETS: Record<ThemeKey, NeonTheme> = {
  'neon-noir': {
    colorBg: '#1A1A1A',
    accentViolet: '#BA8CFF',
    accentLime: '#C4FF4D',
    colorGrid: '#4D4D4D'
  },
  // inspirado en el ejemplo (#212C47 + #7075b1) con acentos neón suaves
  'retro-ocean': {
    colorBg: '#212C47',
    accentViolet: '#7075B1',
    accentLime: '#7CFFB2',
    colorGrid: '#3E4A6B'
  },
  'soft-neon': {
    colorBg: '#151522',
    accentViolet: '#FF5CDE',
    accentLime: '#66FFCC',
    colorGrid: '#3A3A57'
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
