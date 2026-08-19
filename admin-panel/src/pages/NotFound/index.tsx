import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound: React.FC = () => {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Stack alignItems="center" spacing={2} textAlign="center">
        <ErrorOutlineIcon sx={{ fontSize: 72 }} color="primary" />
        <Typography variant="h3" fontWeight={800}>
          404
        </Typography>
        <Typography variant="h6" color="text.secondary">
          The page you're looking for doesn't exist.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained" size="large">
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFound;
