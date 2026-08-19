import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: '60vh',
        width: '100%',
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export function InlineLoading({ size = 20 }: { size?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <CircularProgress size={size} />
    </Box>
  );
}
