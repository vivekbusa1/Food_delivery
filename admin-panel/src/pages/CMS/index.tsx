import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
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
import { cmsService } from '@/services/cms.service';
import { extractErrorMessage } from '@/services/api';
import { formatDateTime } from '@/utils/formatters';
import type { CmsPage } from '@/types';

interface FormValues {
  slug: string;
  title: string;
  content: string;
}

const CMS: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [toDelete, setToDelete] = useState<CmsPage | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms-pages', params],
    queryFn: () => cmsService.list(params),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { slug: '', title: '', content: '' },
  });

  useEffect(() => {
    if (dialogOpen) {
      reset({
        slug: editing?.slug ?? '',
        title: editing?.title ?? '',
        content: editing?.content ?? '',
      });
    }
  }, [dialogOpen, editing, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => (editing ? cmsService.update(editing.id, values) : cmsService.create(values)),
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Page updated' : 'Page created', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      setDialogOpen(false);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => cmsService.update(id, { isPublished }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cms-pages'] }),
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('Page deleted', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      setToDelete(null);
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<CmsPage>[] = [
    {
      key: 'title',
      label: 'Page',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
          <Typography variant="caption" color="text.secondary">/{row.slug}</Typography>
        </Box>
      ),
    },
    { key: 'updatedAt', label: 'Last Updated', render: (row) => formatDateTime(row.updatedAt) },
    {
      key: 'isPublished',
      label: 'Published',
      render: (row) => (
        <Switch
          checked={row.isPublished}
          color="success"
          onChange={() => publishMutation.mutate({ id: row.id, isPublished: !row.isPublished })}
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
        title="CMS Pages"
        subtitle="Manage static content pages such as About, Terms & Privacy Policy"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            Add Page
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
        <DialogTitle>{editing ? 'Edit Page' : 'Add Page'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={6}>
              <TextField label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} {...register('title', { required: true })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Slug"
                fullWidth
                placeholder="about-us"
                error={!!errors.slug}
                helperText={errors.slug?.message}
                {...register('slug', { required: true })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Content" fullWidth multiline minRows={10} {...register('content')} helperText="Supports HTML markup" />
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
        title="Delete Page"
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

export default CMS;
