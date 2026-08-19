import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { PAGE_SIZE_OPTIONS } from '@/utils/constants';
import Loading from './Loading';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  errorMessage,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  emptyMessage = 'No records found',
  toolbar,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
      {toolbar && <Box sx={{ p: 2 }}>{toolbar}</Box>}
      <TableContainer sx={{ maxHeight: 640 }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? 'left'} sx={{ width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  <Loading minHeight={240} />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="error">{errorMessage || 'Failed to load data'}</Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                    <InboxOutlinedIcon fontSize="large" />
                    <Typography variant="body2">{emptyMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  hover
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align ?? 'left'}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
      />
    </Paper>
  );
}

export default DataTable;
