import * as MuiStyles from '@mui/material/styles';

// Create a default MUI theme
export const theme = MuiStyles.createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6', // indigo-500
    },
    secondary: {
      main: '#6366f1', // indigo-600
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
        },
      },
    },
  },
});
