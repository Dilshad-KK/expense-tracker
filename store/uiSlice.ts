import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeName = string;
export type UIState = {
  showJan8Counter: boolean;
  theme: ThemeName;
};

const KEY = 'ui_prefs_v1';

function loadState(): UIState {
  if (typeof window === 'undefined') return { showJan8Counter: true, theme: 'ikbu-dark' };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { showJan8Counter: true, theme: 'ikbu-dark' };

    const parsed = JSON.parse(raw) || {};
    const storedTheme = parsed.theme;
    const theme: ThemeName = (typeof storedTheme === 'string' && storedTheme) ? storedTheme : 'ikbu-dark';

    return {
      showJan8Counter: typeof parsed.showJan8Counter === 'boolean' ? parsed.showJan8Counter : true,
      theme,
    };
  } catch {
    // Fallback to dark on any error
    return { showJan8Counter: true, theme: 'ikbu-dark' };
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
    setShowJan8Counter(state, action: PayloadAction<boolean>) {
      state.showJan8Counter = action.payload;
      persist(state);
    },
    setThemeName(state, action: PayloadAction<ThemeName>) {
      state.theme = action.payload;
      persist(state);
    },
  },
});

export const { setShowJan8Counter, setThemeName } = uiSlice.actions;
export default uiSlice.reducer;
