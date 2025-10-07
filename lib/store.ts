import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import notificationsReducer from '@/store/notificationsSlice';
import { api } from '@/store/api';
import uiReducer from '@/store/uiSlice';
import userReducer from '@/store/userSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    ui: uiReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
