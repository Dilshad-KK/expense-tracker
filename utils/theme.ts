export type ThemeName = 'ikbu' | 'ikbu-dark';

const THEME_KEY = 'ui_theme';

export function getSavedTheme(): ThemeName {
  if (typeof window === 'undefined') return 'ikbu';
  const t = localStorage.getItem(THEME_KEY) as ThemeName | null;
  return (t === 'ikbu' || t === 'ikbu-dark') ? t : 'ikbu';
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

