import React, { useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '@/context/AuthContext';
import { ColorModeProvider, useColorMode } from '@/context/ColorModeContext';
import { getAppTheme } from '@/theme';
import router from '@/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const ThemedApp: React.FC = () => {
  const { mode } = useColorMode();
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={3500}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ColorModeProvider>
      <ThemedApp />
    </ColorModeProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
