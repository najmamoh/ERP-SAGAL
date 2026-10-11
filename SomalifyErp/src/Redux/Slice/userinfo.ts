
// import {createSlice} from '@reduxjs/toolkit'
// import { json } from 'react-router-dom'
// const initialState = localStorage.getItem('userInfo')
//   ? JSON.parse(localStorage.getItem('userInfo')!)
//   : {
//       user: {
//         id: 0,
//         full_name: '',
//         email: '',
//         role: '',
//         company_id: '',
//       },
//       accessToken: '',
//       refreshToken: '',
//       refreshTokenExpiry: '',
//       loginTimestamp: 0,
//     };

// const userInfoSlice = createSlice({
//   name: 'userInfo',
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
//       return action.payload; // overwrite entire state
//     },
//     logout: () => {
//       localStorage.removeItem('userInfo');
//       return {
//         user: {
//           id: 0,
//           full_name: '',
//           email: '',
//           role: '',
//           company_id: '',
//         },
//         accessToken: '',
//         refreshToken: '',
//         refreshTokenExpiry: '',
//         loginTimestamp: 0,
//       };
//     },
//   },
// });

// export default userInfoSlice;
// export const { setUser, logout } = userInfoSlice.actions;


// userInfoSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// // Consistent initial state structure (all fields top-level)
// const initialState = localStorage.getItem('userInfo')
//   ? JSON.parse(localStorage.getItem('userInfo')!)
//   : {
//       id: 0,
//       full_name: '',
//       email: '',
//       role: '',
//       company_id: '',
//       accessToken: '',
//       refreshToken: '',
//       refreshTokenExpiry: '',
//       loginTimestamp: 0,
//     };

// export const userInfoSlice = createSlice({
//   name: 'userInfo',
//   initialState,
//   reducers: {
//     setUser: ( action) => {
//       const newState = action.payload;
//       // Persist to localStorage
//       localStorage.setItem('userInfo', JSON.stringify(newState));
//       return newState;
//     },
//     logout: () => {
//       localStorage.removeItem('userInfo');
//       // Return initial logged-out state
//       return { ...initialState };
//     },
//   },
// });

// export const { setUser, logout } = userInfoSlice.actions;
// // export default userInfoSlice.reducer;




import { createSlice } from '@reduxjs/toolkit';

const emptyState = {
  id: 0,
  full_name: '',
  email: '',
  role: '',
  company_id: '',
  refreshToken: '',
  refreshTokenExpiry: '',
  loginTimestamp: 0,
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : emptyState;
  } catch {
    return emptyState;
  }
}

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: loadFromStorage(),
  reducers: {
    setUser: (_state, action) => {
      const newState = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(newState));
      return newState;
    },
    logout: () => {
      localStorage.removeItem('userInfo');
      // Return a truly empty state, NOT the cached initialState
      return { ...emptyState };
    },
  },
});

export const { setUser, logout } = userInfoSlice.actions;