import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import ImageUploader from '@/components/ImageUploader';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { categoriesService, cuisinesService } from '@/services/categories.service';
import { extractErrorMessage } from '@/services/api';
import type { Cuisine, FoodCategory } from '@/types';

interface FormValues {
  name: string;
  description: string;
  sortOrder: string;
}

const Categories: React.FC = () => {
  const [tab, setTab] = useState<'categories' | 'cuisines'>('categories');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FoodCategory | Cuisine | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesService.list(params),
    enabled: tab === 'categories',
  });

  const cuisinesQuery = useQuery({
    queryKey: ['cuisines', params],
    queryFn: () => cuisinesService.list(params),
    enabled: tab === 'cuisines',
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: '', description: '', sortOrder: '0' },
  });

  useEffect(() => {
    if (dialogOpen) {
      const item = editing as FoodCategory;
      reset({
        name: item?.name ?? '',
        description: (item as FoodCategory)?.description ?? '',
        sortOrder: String((item as FoodCategory)?.sortOrder ?? 0),
      });
      setImageFile(null);
    }
  }, [dialogOpen, editing, reset]);

  const buildFormData = (values: FormValues) => {
    const fd = new FormData();
    fd.append('name', values.name);
    if (tab === 'categories') {
      fd.append('description', values.description);
      fd.append('sortOrder', values.sortOrder);
    }
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const fd = buildFormData(values);
      if (tab === 'categories') {
        return editing ? categoriesService.update(editing.id, fd) : categoriesService.create(fd);
      }
      return editing ? cuisinesService.update(editing.id, fd) : cuisinesService.create(fd);
    },
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Updated successfully' : 'Created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: [tab] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      tab === 'categories' ? categoriesService.toggleActive(id, isActive) : cuisinesService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => (tab === 'categories' ? categoriesService.remove(id) : cuisinesService.remove(id)),
    onSuccess: () => {
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: [tab] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const data = tab === 'categories' ? categoriesQuery.data : cuisinesQuery.data;
  const isLoading = tab === 'categories' ? categoriesQuery.isLoading : cuisinesQuery.isLoading;

  const columns: DataTableColumn<FoodCategory | Cuisine>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row.image} variant="rounded">
            {row.name.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
        </Stack>
      ),
    },
    ...(tab === 'categories'
      ? [
          {
            key: 'description',
            label: 'Description',
            render: (row: FoodCategory) => row.description || '-',
          } as DataTableColumn<FoodCategory | Cuisine>,
          {
            key: 'itemCount',
            label: 'Items',
            align: 'right' as const,
            render: (row: FoodCategory) => row.itemCount ?? 0,
          } as DataTableColumn<FoodCategory | Cuisine>,
        ]
      : []),
    {
      key: 'isActive',
      label: 'Active',
      render: (row) => (
        <Switch
          checked={row.isActive}
          color="success"
          onChange={() => toggleMutation.mutate({ id: row.id, isActive: !row.isActive })}
        />
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
        title="Food Categories & Cuisine"
        subtitle="Organize your catalog structure"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add {tab === 'categories' ? 'Category' : 'Cuisine'}
          </Button>
        }
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="categories" label="Food Categories" />
        <Tab value="cuisines" label="Cuisine" />
      </Tabs>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editing ? 'Edit' : 'Add'} {tab === 'categories' ? 'Category' : 'Cuisine'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <ImageUploader value={(editing as FoodCategory)?.image} onChange={setImageFile} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Name" fullWidth {...register('name', { required: true })} />
            </Grid>
            {tab === 'categories' && (
              <>
                <Grid item xs={12}>
                  <TextField label="Description" fullWidth multiline minRows={2} {...register('description')} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Sort Order" type="number" fullWidth {...register('sortOrder')} />
                </Grid>
              </>
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
        title="Delete Item"
        description={`Are you sure you want to delete "${toDelete?.name}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </Box>
  );
};

export default Categories;
