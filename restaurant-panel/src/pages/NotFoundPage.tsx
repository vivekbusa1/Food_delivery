import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" fontWeight={800} color="primary.main">
        404
      </Typography>
      <Typography variant="h6">Page not found</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to dashboard
      </Button>
    </Box>
  );
}
