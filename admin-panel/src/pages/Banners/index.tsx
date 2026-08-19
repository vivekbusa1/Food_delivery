import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
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
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import ImageUploader from '@/components/ImageUploader';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { bannersService } from '@/services/banners.service';
import { extractErrorMessage } from '@/services/api';
import { formatDate } from '@/utils/formatters';
import type { Banner } from '@/types';

interface FormValues {
  title: string;
  linkType: Banner['linkType'];
  linkValue: string;
  position: Banner['position'];
  startDate: Date | null;
  endDate: Date | null;
}

const Banners: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toDelete, setToDelete] = useState<Banner | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['banners', params],
    queryFn: () => bannersService.list(params),
  });

  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      title: '',
      linkType: 'none',
      linkValue: '',
      position: 'home_top',
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      reset({
        title: editing?.title ?? '',
        linkType: editing?.linkType ?? 'none',
        linkValue: editing?.linkValue ?? '',
        position: editing?.position ?? 'home_top',
        startDate: editing?.startDate ? new Date(editing.startDate) : null,
        endDate: editing?.endDate ? new Date(editing.endDate) : null,
      });
      setImageFile(null);
    }
  }, [dialogOpen, editing, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const fd = new FormData();
      fd.append('title', values.title);
      fd.append('linkType', values.linkType);
      fd.append('linkValue', values.linkValue);
      fd.append('position', values.position);
      if (values.startDate) fd.append('startDate', values.startDate.toISOString());
      if (values.endDate) fd.append('endDate', values.endDate.toISOString());
      if (imageFile) fd.append('image', imageFile);
      return editing ? bannersService.update(editing.id, fd) : bannersService.create(fd);
    },
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Banner updated' : 'Banner created', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => bannersService.toggleActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('Banner deleted', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Banner>[] = [
    {
      key: 'image',
      label: 'Banner',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row.image} variant="rounded" sx={{ width: 64, height: 40 }} />
          <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
        </Stack>
      ),
    },
    { key: 'position', label: 'Position', render: (row) => row.position.replace(/_/g, ' ') },
    { key: 'linkType', label: 'Link Type', render: (row) => row.linkType },
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
          <IconButton
            size="small"
            onClick={() => {
              setEditing(row);
              setDialogOpen(true);
            }}
          >
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
        title="Banner Management"
        subtitle="Manage promotional banners shown across the app"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add Banner
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <ImageUploader value={editing?.image} onChange={setImageFile} height={140} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Title" fullWidth {...register('title', { required: true })} />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <TextField select label="Position" fullWidth {...field}>
                    <MenuItem value="home_top">Home Top</MenuItem>
                    <MenuItem value="home_middle">Home Middle</MenuItem>
                    <MenuItem value="category">Category Page</MenuItem>
                    <MenuItem value="checkout">Checkout</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="linkType"
                control={control}
                render={({ field }) => (
                  <TextField select label="Link Type" fullWidth {...field}>
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="restaurant">Restaurant</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="offer">Offer</MenuItem>
                    <MenuItem value="external">External URL</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Link Value" fullWidth {...register('linkValue')} placeholder="ID or URL depending on link type" />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Start Date"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="End Date"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
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
        title="Delete Banner"
        description={`Are you sure you want to delete "${toDelete?.title}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </Box>
  );
};

export default Banners;
