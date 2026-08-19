import React from 'react';
import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, actions }) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={2}
      mb={3}
    >
      <Box>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs sx={{ mb: 0.5 }}>
            {breadcrumbs.map((crumb, idx) => (
              <Link key={idx} underline="hover" color="text.secondary" variant="body2" href="#">
                {crumb}
              </Link>
            ))}
          </Breadcrumbs>
        )}
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1.5} alignItems="center">
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

export default PageHeader;
