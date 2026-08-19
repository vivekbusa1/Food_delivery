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
import { offersService } from '@/services/offers.service';
import { extractErrorMessage } from '@/services/api';
import { formatDate, titleCase } from '@/utils/formatters';
import type { Offer } from '@/types';

interface FormValues {
  title: string;
  description: string;
  offerType: Offer['offerType'];
  discountValue: number;
  targetId: string;
  startDate: Date | null;
  endDate: Date | null;
}

const Offers: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toDelete, setToDelete] = useState<Offer | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['offers', params],
    queryFn: () => offersService.list(params),
  });

  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      offerType: 'platform',
      discountValue: 0,
      targetId: '',
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      reset({
        title: editing?.title ?? '',
        description: editing?.description ?? '',
        offerType: editing?.offerType ?? 'platform',
        discountValue: editing?.discountValue ?? 0,
        targetId: editing?.targetId ?? '',
        startDate: editing?.startDate ? new Date(editing.startDate) : new Date(),
        endDate: editing?.endDate ? new Date(editing.endDate) : new Date(),
      });
      setImageFile(null);
    }
  }, [dialogOpen, editing, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const fd = new FormData();
      fd.append('title', values.title);
      fd.append('description', values.description);
      fd.append('offerType', values.offerType);
      fd.append('discountValue', String(values.discountValue));
      if (values.targetId) fd.append('targetId', values.targetId);
      if (values.startDate) fd.append('startDate', values.startDate.toISOString());
      if (values.endDate) fd.append('endDate', values.endDate.toISOString());
      if (imageFile) fd.append('image', imageFile);
      return editing ? offersService.update(editing.id, fd) : offersService.create(fd);
    },
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Offer updated' : 'Offer created', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => offersService.toggleActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => offersService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('Offer deleted', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Offer>[] = [
    {
      key: 'title',
      label: 'Offer',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row.image} variant="rounded" />
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
            <Typography variant="caption" color="text.secondary">{row.targetName || titleCase(row.offerType)}</Typography>
          </Box>
        </Stack>
      ),
    },
    { key: 'offerType', label: 'Type', render: (row) => titleCase(row.offerType) },
    { key: 'discountValue', label: 'Discount', render: (row) => `${row.discountValue}%` },
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
        title="Offer Management"
        subtitle="Create special offers for restaurants, categories or the whole platform"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            Add Offer
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
        <DialogTitle>{editing ? 'Edit Offer' : 'Add Offer'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <ImageUploader value={editing?.image} onChange={setImageFile} height={140} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Title" fullWidth {...register('title', { required: true })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline minRows={2} {...register('description')} />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="offerType"
                control={control}
                render={({ field }) => (
                  <TextField select label="Offer Type" fullWidth {...field}>
                    <MenuItem value="platform">Platform Wide</MenuItem>
                    <MenuItem value="restaurant">Restaurant</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="item">Item</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Discount %" type="number" fullWidth {...register('discountValue')} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Target ID (restaurant/category/item)" fullWidth {...register('targetId')} />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker label="Start Date" value={field.value} onChange={field.onChange} slotProps={{ textField: { fullWidth: true } }} />
                )}
              />
            </Grid>
            <Grid item xs={6}>
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
        title="Delete Offer"
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

export default Offers;
