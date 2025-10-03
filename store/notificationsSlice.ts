import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

type Noti = { id: number; title: string; body: string; icon?: string; link?: string; read: boolean; created_at?: string };
type Filter = 'unread' | 'read';

type NotiState = {
  itemsByFilter: Record<Filter, Noti[]>;
  lastFetchedByFilter: Record<Filter, number>;
  unreadCount: number;
  lastCountFetched: number;
  loading: boolean;
  error?: string;
};

const initialState: NotiState = {
  itemsByFilter: { unread: [], read: [] },
  lastFetchedByFilter: { unread: 0, read: 0 },
  unreadCount: 0,
  lastCountFetched: 0,
  loading: false,
};

const STALE_MS = 30_000; // 30s cache window

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (filter: Filter) => {
    const res = await fetch(`/api/notifications?filter=${filter}`);
    const json = await res.json();
    return { filter, items: (json?.items || []) as Noti[] };
  },
  {
    condition: (filter: Filter, { getState }) => {
      const state = getState() as any as { notifications: NotiState };
      const last = state.notifications.lastFetchedByFilter[filter];
      return Date.now() - last > STALE_MS;
    },
  }
);

export const fetchUnreadCount = createAsyncThunk('notifications/count', async () => {
  const res = await fetch('/api/notifications?count=1');
  const json = await res.json();
  return (json?.unread ?? 0) as number;
}, {
  condition: (_, { getState }) => {
    const state = getState() as any as { notifications: NotiState };
    return Date.now() - state.notifications.lastCountFetched > STALE_MS;
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_all_read' }) });
  return true;
});

export const markRead = createAsyncThunk('notifications/markRead', async (id: number) => {
  await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_read', id }) });
  return id;
});

export const clearAll = createAsyncThunk('notifications/clearAll', async () => {
  await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear_all' }) });
  return true;
});

export const clearRead = createAsyncThunk('notifications/clearRead', async () => {
  await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear_read' }) });
  return true;
});

export const clearOne = createAsyncThunk('notifications/clearOne', async (id: number) => {
  await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear', id }) });
  return id;
});

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = undefined; })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<{ filter: Filter; items: Noti[] }>) => {
        const { filter, items } = action.payload;
        state.itemsByFilter[filter] = items;
        state.lastFetchedByFilter[filter] = Date.now();
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.unreadCount = action.payload;
        state.lastCountFetched = Date.now();
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.itemsByFilter.read = [...state.itemsByFilter.read, ...state.itemsByFilter.unread.map(n => ({ ...n, read: true }))];
        state.itemsByFilter.unread = [];
        state.unreadCount = 0;
        state.lastFetchedByFilter.unread = 0;
        state.lastFetchedByFilter.read = 0;
      })
      .addCase(markRead.fulfilled, (state, action: PayloadAction<number>) => {
        const id = action.payload;
        const idx = state.itemsByFilter.unread.findIndex(n => n.id === id);
        if (idx >= 0) {
          const [n] = state.itemsByFilter.unread.splice(idx, 1);
          state.itemsByFilter.read.unshift({ ...n, read: true });
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else {
          // Invalidate caches if not found
          state.lastFetchedByFilter.unread = 0;
          state.lastFetchedByFilter.read = 0;
        }
      })
      .addCase(clearAll.fulfilled, (state) => {
        state.itemsByFilter.unread = [];
        state.itemsByFilter.read = [];
        state.unreadCount = 0;
        state.lastFetchedByFilter.unread = 0;
        state.lastFetchedByFilter.read = 0;
      })
      .addCase(clearRead.fulfilled, (state) => {
        state.itemsByFilter.read = [];
        state.lastFetchedByFilter.read = 0;
      })
      .addCase(clearOne.fulfilled, (state, action: PayloadAction<number>) => {
        const id = action.payload;
        let idx = state.itemsByFilter.unread.findIndex(n => n.id === id);
        if (idx >= 0) {
          state.itemsByFilter.unread.splice(idx, 1);
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          return;
        }
        idx = state.itemsByFilter.read.findIndex(n => n.id === id);
        if (idx >= 0) {
          state.itemsByFilter.read.splice(idx, 1);
        } else {
          state.lastFetchedByFilter.unread = 0;
          state.lastFetchedByFilter.read = 0;
        }
      });
  },
});

export default slice.reducer;
