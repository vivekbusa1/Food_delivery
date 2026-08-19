import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  minHeight?: number | string;
  label?: string;
}

const Loading: React.FC<LoadingProps> = ({ minHeight = 300, label }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap={1.5}
    minHeight={minHeight}
    width="100%"
  >
    <CircularProgress size={32} />
    {label && (
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    )}
  </Box>
);

export default Loading;
