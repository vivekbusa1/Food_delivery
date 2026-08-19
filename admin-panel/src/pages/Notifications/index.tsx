import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '@/components/PageHeader';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { notificationsService } from '@/services/notifications.service';
import { extractErrorMessage } from '@/services/api';
import { formatDateTime, titleCase } from '@/utils/formatters';
import { NOTIFICATION_AUDIENCES } from '@/utils/constants';
import type { NotificationLog } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  channel: z.enum(['push', 'email', 'sms']),
  audience: z.enum(['all', 'customers', 'restaurants', 'delivery_partners', 'segment']),
  scheduledAt: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsService.list(params),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', message: '', channel: 'push', audience: 'all', scheduledAt: null },
  });

  const sendMutation = useMutation({
    mutationFn: (values: FormValues) =>
      notificationsService.send({
        ...values,
        scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : undefined,
      }),
    onSuccess: () => {
      enqueueSnackbar('Notification sent', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      reset({ title: '', message: '', channel: 'push', audience: 'all', scheduledAt: null });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.remove(id),
    onSuccess: () => {
      enqueueSnackbar('Notification removed', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<NotificationLog>[] = [
    {
      key: 'title',
      label: 'Notification',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 320, display: 'block' }}>
            {row.message}
          </Typography>
        </Box>
      ),
    },
    { key: 'channel', label: 'Channel', render: (row) => titleCase(row.channel) },
    { key: 'audience', label: 'Audience', render: (row) => titleCase(row.audience) },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { key: 'sentAt', label: 'Sent At', render: (row) => (row.sentAt ? formatDateTime(row.sentAt) : row.scheduledAt ? `Scheduled: ${formatDateTime(row.scheduledAt)}` : '-') },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(row.id)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Notification Management" subtitle="Compose push, email or SMS campaigns" />

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} lg={5}>
          <Card variant="outlined">
            <CardHeader title="Compose Notification" />
            <CardContent>
              <Stack spacing={2}>
                <TextField label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} {...register('title')} />
                <TextField
                  label="Message"
                  fullWidth
                  multiline
                  minRows={4}
                  error={!!errors.message}
                  helperText={errors.message?.message}
                  {...register('message')}
                />
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="channel"
                    control={control}
                    render={({ field }) => (
                      <TextField select label="Channel" fullWidth {...field}>
                        <MenuItem value="push">Push Notification</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="sms">SMS</MenuItem>
                      </TextField>
                    )}
                  />
                  <Controller
                    name="audience"
                    control={control}
                    render={({ field }) => (
                      <TextField select label="Audience" fullWidth {...field}>
                        {NOTIFICATION_AUDIENCES.map((a) => (
                          <MenuItem key={a} value={a}>
                            {titleCase(a)}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Stack>
                <Controller
                  name="scheduledAt"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Schedule for later (optional)"
                      value={field.value ?? null}
                      onChange={field.onChange}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SendOutlinedIcon />}
                  disabled={sendMutation.isPending}
                  onClick={handleSubmit((v) => sendMutation.mutate(v))}
                >
                  {sendMutation.isPending ? 'Sending...' : 'Send Notification'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Notification History
          </Typography>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Notifications;
