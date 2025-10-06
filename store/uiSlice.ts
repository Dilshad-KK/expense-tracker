import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UIState = {
  showJan8Counter: boolean;
};

const KEY = 'ui_prefs_v1';

function loadState(): UIState {
  if (typeof window === 'undefined') return { showJan8Counter: true };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { showJan8Counter: true };
    const parsed = JSON.parse(raw);
    return {
      showJan8Counter: typeof parsed.showJan8Counter === 'boolean' ? parsed.showJan8Counter : true,
    };
  } catch {
    return { showJan8Counter: true };
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
  },
});

export const { setShowJan8Counter } = uiSlice.actions;
export default uiSlice.reducer;

