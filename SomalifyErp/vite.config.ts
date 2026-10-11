import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

import { VitePWA } from 'vite-plugin-pwa';
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // basicSsl(),
    react(),
    
  ],
  base: '/',
  build: {
    outDir: 'dist',
    commonjsOptions: {
      include: [/node_modules/, /prop-types/, /react-is/, /@mui\/system/, /@emotion/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      '@mui/material', 
      '@mui/system', 
      '@emotion/react', 
      '@emotion/styled',
      '@mui/x-charts'
    ],
    preserveSymlinks: false,
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/system',
      '@mui/system/colorManipulator',
      '@mui/system/createStyled',
      '@mui/utils',
      '@emotion/react',
      '@emotion/styled',
      '@mui/x-charts',
      '@mui/x-charts/PieChart',
      '@mui/x-charts/hooks',
      'prop-types',
      'react-is',
    ],
    exclude: ['@mui/material/Box'],
    esbuildOptions: {
      jsx: 'automatic',
    },
  },
  // server: {
  //   https: true,
  //   host: true,
  //   port: 3000
  // }
})
