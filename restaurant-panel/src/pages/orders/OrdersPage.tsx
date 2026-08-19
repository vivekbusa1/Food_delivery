import { useMemo, useState } from 'react';
import { Box, Grid, Pagination, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderDetailsDialog } from '@/components/orders/OrderDetailsDialog';
import { AssignDeliveryDialog } from '@/components/orders/AssignDeliveryDialog';
import { RejectOrderDialog } from '@/components/orders/RejectOrderDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { useOrders } from '@/hooks/useOrders';
import type { Order, OrderStatus } from '@/types';

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'New', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Out for delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'All', value: 'all' },
];

const PAGE_SIZE = 12;

export default function OrdersPage() {
  const [statusTab, setStatusTab] = useState<OrderStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({ status: statusTab, page, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
    [statusTab, page, debouncedSearch]
  );

  const { data: ordersPage, isLoading, isFetching } = useOrders(params);

  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);
  const [rejectOrder, setRejectOrder] = useState<Order | null>(null);

  const orders = ordersPage?.data ?? [];
  const totalPages = ordersPage?.meta.totalPages ?? 1;

  return (
    <Box>
      <PageHeader
        title="Orders"
        description="Manage incoming orders in real time, from acceptance to delivery."
        actions={
          isFetching && !isLoading ? (
            <Typography variant="caption" color="text.secondary">
              Refreshing…
            </Typography>
          ) : undefined
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Tabs
          value={statusTab}
          onChange={(_, value) => {
            setStatusTab(value);
            setPage(1);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
        <TextField
          placeholder="Search order # or customer…"
          size="small"
          sx={{ minWidth: { sm: 260 } }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Stack>

      {isLoading ? (
        <LoadingScreen label="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders here"
          description="Orders matching this filter will show up here automatically."
          icon={<ReceiptLongRoundedIcon fontSize="inherit" />}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {orders.map((order) => (
              <Grid item xs={12} sm={6} lg={4} key={order.id}>
                <OrderCard
                  order={order}
                  onReject={setRejectOrder}
                  onAssignDelivery={setAssignOrder}
                  onViewDetails={setDetailsOrder}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
            </Stack>
          )}
        </>
      )}

      <OrderDetailsDialog open={Boolean(detailsOrder)} onClose={() => setDetailsOrder(null)} order={detailsOrder} />
      <AssignDeliveryDialog open={Boolean(assignOrder)} onClose={() => setAssignOrder(null)} order={assignOrder} />
      <RejectOrderDialog open={Boolean(rejectOrder)} onClose={() => setRejectOrder(null)} order={rejectOrder} />
    </Box>
  );
}
