import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  uid: string;
  phoneNumber?: string | null;
  displayName?: string | null;
};

type UserState = { user: AuthUser | null };

const initialState: UserState = { user: null };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

