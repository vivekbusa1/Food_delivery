import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { titleCase } from '@/utils/formatters';

interface StatusChipProps {
  status: string;
  colorMap?: Record<string, ChipProps['color']>;
  size?: ChipProps['size'];
}

const DEFAULT_COLOR_MAP: Record<string, ChipProps['color']> = {
  active: 'success',
  approved: 'success',
  delivered: 'success',
  success: 'success',
  paid: 'success',
  sent: 'success',
  processed: 'success',
  online: 'success',
  published: 'success',

  inactive: 'default',
  refunded: 'default',
  draft: 'default',
  offline: 'default',

  pending: 'warning',
  scheduled: 'warning',
  preparing: 'warning',
  unassigned: 'warning',

  confirmed: 'info',
  assigned: 'info',
  ready: 'info',
  out_for_delivery: 'info',
  picked_up: 'info',

  blocked: 'error',
  rejected: 'error',
  cancelled: 'error',
  failed: 'error',
  suspended: 'error',
};

const StatusChip: React.FC<StatusChipProps> = ({ status, colorMap = DEFAULT_COLOR_MAP, size = 'small' }) => {
  const color = colorMap[status] ?? 'default';
  return <Chip label={titleCase(status)} color={color} size={size} variant={color === 'default' ? 'outlined' : 'filled'} />;
};

export default StatusChip;
