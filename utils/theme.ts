export type ThemeName = string;

const THEME_KEY = 'ui_theme';

export function getSavedTheme(): ThemeName {
  if (typeof window === 'undefined') return 'ikbu-dark';
  const t = localStorage.getItem(THEME_KEY) as ThemeName | null;
  if (t && typeof t === 'string') return t;
  return 'ikbu-dark';
}

export function applyTheme(theme: ThemeName) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

export function setTheme(theme: ThemeName) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}
