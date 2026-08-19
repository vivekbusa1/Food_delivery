import { Avatar, Box, Card, CardContent, Skeleton, Stack, Typography, alpha } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  color?: string;
  changePercent?: number;
  isLoading?: boolean;
  subtitle?: string;
}

export function StatCard({
  label,
  value,
  icon,
  color = '#ED5A2C',
  changePercent,
  isLoading,
  subtitle,
}: StatCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            {isLoading ? (
              <Skeleton width={100} height={40} />
            ) : (
              <Typography variant="h5" sx={{ mt: 0.5 }}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: alpha(color, 0.15),
              color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
        {typeof changePercent === 'number' && !isLoading && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
            {isPositive ? (
              <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              fontWeight={700}
              color={isPositive ? 'success.main' : 'error.main'}
            >
              {Math.abs(changePercent).toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
