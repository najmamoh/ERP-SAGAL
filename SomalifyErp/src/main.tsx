import React from 'react'
import ReactDOM from 'react-dom/client'
import './axiosGlobal' // 401 → main/company refresh, retry request, redirect to login on refresh failure
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './Redux/Store.tsx'
import { Toaster } from 'react-hot-toast'
import CssBaseline from '@mui/material/CssBaseline'
// Namespace import to avoid Vite/MUI "createTheme_default is not a function" interop
import * as MuiStyles from '@mui/material/styles'

const theme = MuiStyles.createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3b82f6' },
    secondary: { main: '#6366f1' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { scrollbarWidth: 'thin' },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MuiStyles.ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <Toaster/>
      </MuiStyles.ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
