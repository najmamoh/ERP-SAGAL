/**
 * Presentation: User Redux Slice
 * Manages user authentication state
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSession } from '../../../domain/entities/User';

const initialState: UserSession = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo')!)
  : {
      id: 0,
      full_name: '',
      email: '',
      role: 'user',
      company_id: '',
      accessToken: '',
      refreshToken: '',
      refreshTokenExpiry: '',
      loginTimestamp: 0,
    };

export const userSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction<UserSession>) => {
      const newState = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(newState));
      return newState;
    },
    logout: () => {
      localStorage.removeItem('userInfo');
      return { ...initialState };
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
