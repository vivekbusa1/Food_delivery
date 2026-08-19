import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { rolesService } from '@/services/roles.service';
import { extractErrorMessage } from '@/services/api';
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from '@/utils/constants';
import type { Role } from '@/types';

interface FormValues {
  name: string;
  description: string;
}

const RoleManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['roles', params],
    queryFn: () => rolesService.list(params),
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (dialogOpen) {
      reset({ name: editing?.name ?? '', description: editing?.description ?? '' });
      setSelectedPermissions(editing?.permissions ?? []);
    }
  }, [dialogOpen, editing, reset]);

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, permissions: selectedPermissions };
      return editing ? rolesService.update(editing.id, payload) : rolesService.create(payload);
    },
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Role updated' : 'Role created', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('Role deleted', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'name',
      label: 'Role',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.description}</Typography>
        </Box>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap maxWidth={360}>
          {row.permissions.slice(0, 3).map((p) => (
            <Chip key={p} label={p} size="small" />
          ))}
          {row.permissions.length > 3 && <Chip label={`+${row.permissions.length - 3} more`} size="small" variant="outlined" />}
        </Stack>
      ),
    },
    { key: 'usersCount', label: 'Users', align: 'right', render: (row) => row.usersCount ?? 0 },
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
        title="Role Management"
        subtitle="Define roles and control access permissions"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            Add Role
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
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Role' : 'Add Role'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={6}>
              <TextField label="Role Name" fullWidth {...register('name', { required: true })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Description" fullWidth {...register('description')} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={700} mt={1} mb={1}>
                Permissions
              </Typography>
              <Grid container spacing={1.5}>
                {PERMISSION_GROUPS.map((group) => {
                  const groupPerms = ALL_PERMISSIONS.filter((p) => p.group === group);
                  if (groupPerms.length === 0) return null;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={group}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {group.toUpperCase()}
                      </Typography>
                      <Stack>
                        {groupPerms.map((perm) => (
                          <FormControlLabel
                            key={perm.key}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedPermissions.includes(perm.key)}
                                onChange={() => togglePermission(perm.key)}
                              />
                            }
                            label={<Typography variant="body2">{perm.label}</Typography>}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
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
        title="Delete Role"
        description={`Are you sure you want to delete the "${toDelete?.name}" role?`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </Box>
  );
};

export default RoleManagement;
