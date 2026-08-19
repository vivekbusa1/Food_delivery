import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { couponsService } from '@/services/coupons.service';
import { extractErrorMessage } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Coupon } from '@/types';

const schema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.coerce.number().positive('Must be greater than 0'),
  maxDiscount: z.coerce.number().optional(),
  minOrderValue: z.coerce.number().optional(),
  usageLimit: z.coerce.number().optional(),
  usagePerUser: z.coerce.number().optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
});

type FormValues = z.infer<typeof schema>;

const Coupons: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, search, setSearch, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['coupons', params],
    queryFn: () => couponsService.list(params),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscount: undefined,
      minOrderValue: undefined,
      usageLimit: undefined,
      usagePerUser: undefined,
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      reset({
        code: editing?.code ?? '',
        description: editing?.description ?? '',
        discountType: editing?.discountType ?? 'percentage',
        discountValue: editing?.discountValue ?? 0,
        maxDiscount: editing?.maxDiscount,
        minOrderValue: editing?.minOrderValue,
        usageLimit: editing?.usageLimit,
        usagePerUser: editing?.usagePerUser,
        startDate: editing?.startDate ? new Date(editing.startDate) : new Date(),
        endDate: editing?.endDate ? new Date(editing.endDate) : new Date(),
      });
    }
  }, [dialogOpen, editing, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      editing
        ? couponsService.update(editing.id, values as unknown as Partial<Coupon>)
        : couponsService.create(values as unknown as Partial<Coupon>),
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Coupon updated' : 'Coupon created', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => couponsService.toggleActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('Coupon deleted', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Coupon>[] = [
    {
      key: 'code',
      label: 'Code',
      render: (row) => <Chip label={row.code} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />,
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (row) => (row.discountType === 'percentage' ? `${row.discountValue}%` : formatCurrency(row.discountValue)),
    },
    { key: 'minOrderValue', label: 'Min Order', render: (row) => (row.minOrderValue ? formatCurrency(row.minOrderValue) : '-') },
    { key: 'usage', label: 'Usage', render: (row) => `${row.usedCount ?? 0}${row.usageLimit ? ` / ${row.usageLimit}` : ''}` },
    { key: 'startDate', label: 'Start', render: (row) => formatDate(row.startDate) },
    { key: 'endDate', label: 'End', render: (row) => formatDate(row.endDate) },
    {
      key: 'isActive',
      label: 'Active',
      render: (row) => (
        <Switch checked={row.isActive} color="success" onChange={() => toggleMutation.mutate({ id: row.id, isActive: !row.isActive })} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" justifyContent="flex-end">
          <IconButton size="small" onClick={() => { setEditing(row); setDialogOpen(true); }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setToDelete(row)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Coupon Management"
        subtitle="Create and manage discount coupons"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            Add Coupon
          </Button>
        }
      />

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
          <TextField
            placeholder="Search by coupon code"
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
        }
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={6}>
              <TextField label="Coupon Code" fullWidth error={!!errors.code} helperText={errors.code?.message} {...register('code')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <TextField select label="Discount Type" fullWidth {...field}>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="flat">Flat Amount</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline minRows={2} {...register('description')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount Value"
                type="number"
                fullWidth
                error={!!errors.discountValue}
                helperText={errors.discountValue?.message}
                {...register('discountValue')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Max Discount (optional)" type="number" fullWidth {...register('maxDiscount')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Minimum Order Value" type="number" fullWidth {...register('minOrderValue')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Total Usage Limit" type="number" fullWidth {...register('usageLimit')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Usage Limit Per User" type="number" fullWidth {...register('usagePerUser')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker label="Start Date" value={field.value} onChange={field.onChange} slotProps={{ textField: { fullWidth: true } }} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker label="End Date" value={field.value} onChange={field.onChange} slotProps={{ textField: { fullWidth: true } }} />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saveMutation.isPending} onClick={handleSubmit((v) => saveMutation.mutate(v))}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon "${toDelete?.code}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </Box>
  );
};

export default Coupons;
