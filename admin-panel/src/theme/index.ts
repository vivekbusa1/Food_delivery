import { createTheme, ThemeOptions } from '@mui/material/styles';

/** Shared brand with mobile-app / restaurant-panel (#FF6B35). */
const brand = {
  main: '#FF6B35',
  light: '#FF8A5C',
  dark: '#E85A2A',
  contrastText: '#FFFFFF',
};

const secondary = {
  main: '#2EC4B6',
  light: '#5CE0D3',
  dark: '#1FA89C',
  contrastText: '#FFFFFF',
};

const shared: ThemeOptions = {
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['Inter', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 14, boxShadow: '0 6px 24px -12px rgba(28, 25, 23, 0.14)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#FFF5F0' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
};

export const getAppTheme = (mode: 'light' | 'dark' = 'light') =>
  createTheme({
    ...shared,
    palette: {
      mode: 'light',
      primary: brand,
      secondary,
      success: { main: '#3BB273' },
      warning: { main: '#F4A259' },
      error: { main: '#E5484D' },
      info: { main: '#2E86DE' },
      background: { default: '#FAF8F6', paper: '#FFFFFF' },
      text: { primary: '#1C1917', secondary: '#5B5955' },
      divider: 'rgba(91, 89, 85, 0.14)',
    },
  });

export default getAppTheme;
