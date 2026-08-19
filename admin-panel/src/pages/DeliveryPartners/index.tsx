import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import {
  Avatar,
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
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { deliveryPartnersService } from '@/services/delivery.service';
import { extractErrorMessage } from '@/services/api';
import { formatDate, getInitials } from '@/utils/formatters';
import { VEHICLE_TYPES } from '@/utils/constants';
import type { DeliveryPartner } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  vehicleType: z.string().min(1, 'Select a vehicle type'),
  vehicleNumber: z.string().optional(),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const DeliveryPartners: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, search, setSearch, filters, setFilter, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryPartner | null>(null);
  const [toDelete, setToDelete] = useState<DeliveryPartner | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['delivery-partners', params],
    queryFn: () => deliveryPartnersService.list(params),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', vehicleType: 'bike', vehicleNumber: '', password: '' },
  });

  useEffect(() => {
    if (dialogOpen) {
      reset(
        editing
          ? {
              name: editing.name,
              email: editing.email,
              phone: editing.phone,
              vehicleType: editing.vehicleType,
              vehicleNumber: editing.vehicleNumber ?? '',
              password: '',
            }
          : { name: '', email: '', phone: '', vehicleType: 'bike', vehicleNumber: '', password: '' }
      );
    }
  }, [dialogOpen, editing, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      editing ? deliveryPartnersService.update(editing.id, values) : deliveryPartnersService.create(values),
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Delivery partner updated' : 'Delivery partner created', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeliveryPartner['status'] }) =>
      deliveryPartnersService.setStatus(id, status),
    onSuccess: () => {
      enqueueSnackbar('Status updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      deliveryPartnersService.verifyDocuments(id, verified),
    onSuccess: () => {
      enqueueSnackbar('Verification status updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deliveryPartnersService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('Delivery partner removed', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<DeliveryPartner>[] = [
    {
      key: 'name',
      label: 'Partner',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row.avatar} sx={{ width: 34, height: 34 }}>{getInitials(row.name)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.phone}</Typography>
          </Box>
        </Stack>
      ),
    },
    { key: 'vehicle', label: 'Vehicle', render: (row) => `${row.vehicleType}${row.vehicleNumber ? ` • ${row.vehicleNumber}` : ''}` },
    { key: 'rating', label: 'Rating', render: (row) => (row.rating ? row.rating.toFixed(1) : '-') },
    { key: 'totalDeliveries', label: 'Deliveries', align: 'right', render: (row) => row.totalDeliveries ?? 0 },
    {
      key: 'online',
      label: 'Online',
      render: (row) => <Chip size="small" label={row.isOnline ? 'Online' : 'Offline'} color={row.isOnline ? 'success' : 'default'} />,
    },
    {
      key: 'verified',
      label: 'Documents',
      render: (row) => (
        <Tooltip title={row.documentsVerified ? 'Verified — click to unverify' : 'Unverified — click to verify'}>
          <IconButton
            size="small"
            color={row.documentsVerified ? 'success' : 'warning'}
            onClick={(e) => {
              e.stopPropagation();
              verifyMutation.mutate({ id: row.id, verified: !row.documentsVerified });
            }}
          >
            {row.documentsVerified ? <VerifiedOutlinedIcon /> : <GppMaybeOutlinedIcon />}
          </IconButton>
        </Tooltip>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    {
      key: 'active',
      label: 'Active',
      render: (row) => (
        <Switch
          checked={row.status === 'active'}
          color="success"
          onClick={(e) => e.stopPropagation()}
          onChange={() => statusMutation.mutate({ id: row.id, status: row.status === 'active' ? 'inactive' : 'active' })}
        />
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" justifyContent="flex-end">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(row);
              setDialogOpen(true);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(row);
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const onSubmit = (values: FormValues) => saveMutation.mutate(values);

  return (
    <Box>
      <PageHeader
        title="Delivery Partners"
        subtitle="Manage delivery fleet, verification & availability"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add Partner
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name or phone"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
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
              label="Status"
              value={(filters.status as string) ?? ''}
              onChange={(e) => setFilter('status', e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>
          </Stack>
        }
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Delivery Partner' : 'Add Delivery Partner'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} {...register('name')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} {...register('email')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} {...register('phone')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="vehicleType"
                control={control}
                render={({ field }) => (
                  <TextField select label="Vehicle Type" fullWidth {...field}>
                    {VEHICLE_TYPES.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Vehicle Number" fullWidth {...register('vehicleNumber')} />
            </Grid>
            {!editing && (
              <Grid item xs={12} sm={6}>
                <TextField label="Temporary Password" type="password" fullWidth {...register('password')} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saveMutation.isPending} onClick={handleSubmit(onSubmit)}>
            {editing ? 'Save Changes' : 'Create Partner'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove Delivery Partner"
        description={`Are you sure you want to remove "${toDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Remove"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </Box>
  );
};

export default DeliveryPartners;
