import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Chip, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { logsService } from '@/services/logs.service';
import { formatDateTime } from '@/utils/formatters';
import type { LogEntry } from '@/types';

const LEVEL_COLORS: Record<LogEntry['level'], 'default' | 'warning' | 'error' | 'info'> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
};

const Logs: React.FC = () => {
  const { page, setPage, limit, setLimit, search, setSearch, filters, setFilter, params } = useTableQueryState();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['logs', params],
    queryFn: () => logsService.list(params),
  });

  const columns: DataTableColumn<LogEntry>[] = [
    {
      key: 'level',
      label: 'Level',
      render: (row) => <Chip label={row.level.toUpperCase()} color={LEVEL_COLORS[row.level]} size="small" />,
    },
    { key: 'actor', label: 'Actor', render: (row) => row.actor },
    { key: 'action', label: 'Action', render: (row) => row.action },
    {
      key: 'entity',
      label: 'Entity',
      render: (row) => (
        <Typography variant="body2">
          {row.entity}
          {row.entityId && <Typography component="span" variant="caption" color="text.secondary"> #{row.entityId}</Typography>}
        </Typography>
      ),
    },
    { key: 'message', label: 'Message', render: (row) => row.message },
    { key: 'ip', label: 'IP Address', render: (row) => row.ip || '-' },
    { key: 'createdAt', label: 'Timestamp', render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <Box>
      <PageHeader title="System Logs" subtitle="Audit trail of admin actions and system events" />

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        page={page}
        limit={limit}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={setLimit}
        toolbar={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search logs"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Level"
              value={(filters.level as string) ?? ''}
              onChange={(e) => setFilter('level', e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </TextField>
          </Stack>
        }
      />
    </Box>
  );
};

export default Logs;
