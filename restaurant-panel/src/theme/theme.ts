import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

/** Aligned with mobile-app / admin-panel brand (#FF6B35). */
const brandOrange = '#FF6B35';
const brandTeal = '#2EC4B6';
const brandGold = '#F4A259';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandOrange,
      light: '#FF8A5C',
      dark: '#E85A2A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandTeal,
      light: '#5CE0D3',
      dark: '#1FA89C',
      contrastText: '#FFFFFF',
    },
    brand: {
      main: brandGold,
      light: '#FFD37A',
      dark: '#DB8F13',
      contrastText: '#3A2400',
    },
    success: { main: '#3BB273' },
    warning: { main: '#F4A259' },
    error: { main: '#E5484D' },
    info: { main: '#2E86DE' },
    background: {
      default: '#FAF8F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1917',
      secondary: '#5B5955',
    },
    divider: alpha('#5B5955', 0.14),
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", "sans-serif"',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${alpha(brandOrange, 0.5)} transparent`,
          backgroundColor: '#FAF8F6',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
        },
        containedPrimary: {
          boxShadow: '0 8px 20px -8px rgba(255, 107, 53, 0.45)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 24px -12px rgba(28, 25, 23, 0.14)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#5B5955',
          backgroundColor: '#FFF5F0',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});
