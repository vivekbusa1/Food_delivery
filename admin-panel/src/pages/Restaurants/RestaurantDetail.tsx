import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import StatCard from '@/components/StatCard';
import DataTable, { DataTableColumn } from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { restaurantsService } from '@/services/restaurants.service';
import { extractErrorMessage } from '@/services/api';
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/utils/formatters';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import type { Order, Restaurant } from '@/types';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { page, setPage, limit, setLimit, params } = useTableQueryState();
  const [commissionDraft, setCommissionDraft] = useState<string>('');

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantsService.get(id as string),
    enabled: Boolean(id),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['restaurant-orders', id, params],
    queryFn: () => restaurantsService.getOrders(id as string, params),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: Restaurant['status']) => restaurantsService.setStatus(id as string, status),
    onSuccess: () => {
      enqueueSnackbar('Restaurant status updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['restaurant', id] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const commissionMutation = useMutation({
    mutationFn: (commissionRate: number) => restaurantsService.update(id as string, { commissionRate }),
    onSuccess: () => {
      enqueueSnackbar('Commission rate updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['restaurant', id] });
    },
    onError: (err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'error' }),
  });

  const columns: DataTableColumn<Order>[] = [
    { key: 'orderNumber', label: 'Order #', render: (row) => `#${row.orderNumber}` },
    { key: 'customer', label: 'Customer', render: (row) => row.customer?.name },
    { key: 'total', label: 'Total', align: 'right', render: (row) => formatCurrency(row.total) },
    { key: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
  ];

  if (isLoading) return <Loading minHeight={400} />;
  if (!restaurant) return <Typography>Restaurant not found</Typography>;

  return (
    <Box>
      <PageHeader
        title={restaurant.name}
        subtitle={restaurant.address}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/restaurants')}>
              Back
            </Button>
            {restaurant.status !== 'suspended' ? (
              <Button variant="contained" color="error" onClick={() => statusMutation.mutate('suspended')}>
                Suspend
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={() => statusMutation.mutate('approved')}>
                Reinstate
              </Button>
            )}
          </Stack>
        }
      />

      <Grid container spacing={2.5} mb={1}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Orders" value={restaurant.totalOrders ?? 0} icon={<ReceiptLongOutlinedIcon />} color="info" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Rating" value={restaurant.rating ? restaurant.rating.toFixed(1) : '-'} icon={<StarOutlinedIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Commission Rate"
            value={`${restaurant.commissionRate ?? 0}%`}
            icon={<PercentOutlinedIcon />}
            color="primary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined">
            <CardContent>
              <Stack alignItems="center" spacing={1.5} mb={2}>
                <Avatar src={restaurant.logo} variant="rounded" sx={{ width: 72, height: 72 }}>
                  {getInitials(restaurant.name)}
                </Avatar>
                <StatusChip status={restaurant.status} />
              </Stack>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Owner</Typography>
                  <Typography variant="body2">{restaurant.ownerName || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{restaurant.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2">{restaurant.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Joined</Typography>
                  <Typography variant="body2">{formatDate(restaurant.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Cuisines</Typography>
                  <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" useFlexGap>
                    {restaurant.cuisines?.map((c) => (
                      <Chip key={c} label={c} size="small" />
                    ))}
                  </Stack>
                </Box>
              </Stack>

              <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
                Update Commission Rate
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  type="number"
                  placeholder={String(restaurant.commissionRate ?? 0)}
                  value={commissionDraft}
                  onChange={(e) => setCommissionDraft(e.target.value)}
                  InputProps={{ endAdornment: '%' }}
                  fullWidth
                />
                <Button
                  variant="contained"
                  disabled={!commissionDraft || commissionMutation.isPending}
                  onClick={() => commissionMutation.mutate(Number(commissionDraft))}
                >
                  Save
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Recent Orders
          </Typography>
          <DataTable
            columns={columns}
            rows={orders?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={ordersLoading}
            page={page}
            limit={limit}
            total={orders?.total ?? 0}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onRowClick={(row) => navigate(`/orders/${row.id}`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RestaurantDetail;
