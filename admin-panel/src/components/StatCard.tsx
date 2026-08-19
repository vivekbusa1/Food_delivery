import React from 'react';
import { Avatar, Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  change?: number;
  changeLabel?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  change,
  changeLabel = 'vs last period',
  isLoading,
}) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {isLoading ? (
              <Skeleton width={100} height={40} />
            ) : (
              <Typography variant="h5" fontWeight={700}>
                {value}
              </Typography>
            )}
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: (theme) => `${theme.palette[color].main}22`,
              color: (theme) => theme.palette[color].main,
              width: 44,
              height: 44,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
        {typeof change === 'number' && !isLoading && (
          <Stack direction="row" alignItems="center" spacing={0.5} mt={1.5}>
            {isPositive ? (
              <ArrowUpwardIcon fontSize="small" color="success" />
            ) : (
              <ArrowDownwardIcon fontSize="small" color="error" />
            )}
            <Typography variant="caption" color={isPositive ? 'success.main' : 'error.main'} fontWeight={700}>
              {Math.abs(change).toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {changeLabel}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
