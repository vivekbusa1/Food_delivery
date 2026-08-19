import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import {
  Avatar,
  Box,
  Button,
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
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { staffUsersService } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
import { extractErrorMessage } from '@/services/api';
import { formatDateTime, getInitials } from '@/utils/formatters';
import type { StaffUser } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Select a role'),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, search, setSearch, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [toDelete, setToDelete] = useState<StaffUser | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff-users', params],
    queryFn: () => staffUsersService.list(params),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles-lite'],
    queryFn: () => rolesService.list({ limit: 100 }),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', role: '', password: '' },
  });

  useEffect(() => {
    if (dialogOpen) {
      reset({
        name: editing?.name ?? '',
        email: editing?.email ?? '',
        phone: editing?.phone ?? '',
        role: editing?.role ?? '',
        password: '',
      });
    }
  }, [dialogOpen, editing, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      editing ? staffUsersService.update(editing.id, values) : staffUsersService.create(values as FormValues & { password: string }),
    onSuccess: () => {
      enqueueSnackbar(editing ? 'User updated' : 'User created', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => staffUsersService.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-users'] }),
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffUsersService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('User removed', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<StaffUser>[] = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34 }}>{getInitials(row.name)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Box>
        </Stack>
      ),
    },
    { key: 'role', label: 'Role', render: (row) => row.role },
    { key: 'lastLogin', label: 'Last Login', render: (row) => formatDateTime(row.lastLogin) },
    {
      key: 'active',
      label: 'Active',
      render: (row) => (
        <Switch
          checked={row.status === 'active'}
          color="success"
          onChange={() => statusMutation.mutate({ id: row.id, status: row.status === 'active' ? 'inactive' : 'active' })}
        />
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
        title="User Management"
        subtitle="Manage admin & staff accounts with access to this panel"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            Add User
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
            placeholder="Search by name or email"
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
        <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" fullWidth error={!!errors.name} helperText={errors.name?.message} {...register('name')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} {...register('email')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" fullWidth {...register('phone')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField select label="Role" fullWidth error={!!errors.role} helperText={errors.role?.message} {...field}>
                    {(roles?.items ?? []).map((r) => (
                      <MenuItem key={r.id} value={r.name}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            {!editing && (
              <Grid item xs={12}>
                <TextField label="Temporary Password" type="password" fullWidth {...register('password')} />
              </Grid>
            )}
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
        title="Remove User"
        description={`Are you sure you want to remove "${toDelete?.name}"?`}
        confirmLabel="Remove"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </Box>
  );
};

export default UserManagement;
