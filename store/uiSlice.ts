import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeName = string;
export type UIState = {
  theme: ThemeName;
};

const KEY = 'ui_prefs_v1';

function loadState(): UIState {
  if (typeof window === 'undefined') return { theme: 'ikbu-dark' };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { theme: 'ikbu-dark' };

    const parsed = JSON.parse(raw) || {};
    const storedTheme = parsed.theme;
    const theme: ThemeName = (typeof storedTheme === 'string' && storedTheme) ? storedTheme : 'ikbu-dark';

    return { theme };
  } catch {
    // Fallback to dark on any error
    return { theme: 'ikbu-dark' };
  }
}

function persist(state: UIState) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

const initialState: UIState = loadState();

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeName(state, action: PayloadAction<ThemeName>) {
      state.theme = action.payload;
      persist(state);
    },
  },
});

export const { setThemeName } = uiSlice.actions;
export default uiSlice.reducer;
