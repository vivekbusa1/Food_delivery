import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { FoodFormDialog } from '@/components/food/FoodFormDialog';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeleteFood, useFoods, useSetFoodAvailability } from '@/hooks/useFoods';
import { formatCurrency, resolveAssetUrl } from '@/utils/formatters';
import { ASSET_BASE_URL } from '@/utils/constants';
import type { FoodItem } from '@/types';

const PAGE_SIZE = 10;

export default function FoodManagementPage() {
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    }),
    [page, debouncedSearch, categoryFilter]
  );

  const { data: foodsPage, isLoading } = useFoods(params);
  const setAvailability = useSetFoodAvailability();
  const deleteFood = useDeleteFood();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FoodItem | null>(null);

  function openCreate() {
    setSelectedFood(null);
    setFormOpen(true);
  }

  function openEdit(food: FoodItem) {
    setSelectedFood(food);
    setFormOpen(true);
  }

  const items = foodsPage?.data ?? [];
  const totalPages = foodsPage?.meta.totalPages ?? 1;

  return (
    <Box>
      <PageHeader
        title="Food Management"
        description="Add, update and manage your menu items, pricing and availability."
        actions={
          <Chip
            icon={<AddRoundedIcon />}
            label="Add food item"
            color="primary"
            onClick={openCreate}
            sx={{ px: 1, cursor: 'pointer' }}
          />
        }
      />

      <Paper sx={{ p: 2, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search food items…"
            fullWidth
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <TextField
            select
            label="Category"
            sx={{ minWidth: { sm: 220 } }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">All categories</MenuItem>
            {categories?.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {isLoading ? (
        <LoadingScreen label="Loading menu…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No food items found"
          description="Try adjusting your filters, or add a new item to your menu."
          icon={<RestaurantMenuRoundedIcon fontSize="inherit" />}
          actionLabel="Add food item"
          onAction={openCreate}
        />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="right">Effective price</TableCell>
                  <TableCell align="center">Available</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((food) => (
                  <TableRow key={food.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          variant="rounded"
                          src={resolveAssetUrl(food.images?.[0], ASSET_BASE_URL)}
                          sx={{ width: 44, height: 44 }}
                        >
                          <RestaurantMenuRoundedIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {food.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={food.isVeg ? 'Veg' : 'Non-veg'}
                            color={food.isVeg ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ height: 18, fontSize: 10, mt: 0.25 }}
                          />
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{food.categoryName ?? '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(food.price)}</TableCell>
                    <TableCell align="right">
                      {food.discountPercent ? `${food.discountPercent}%` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>{formatCurrency(food.effectivePrice ?? food.price)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={food.isAvailable}
                        onChange={(_, checked) =>
                          setAvailability.mutate({ id: food.id, isAvailable: checked })
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(food)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(food)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ py: 2.5 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          )}
        </Paper>
      )}

      <FoodFormDialog open={formOpen} onClose={() => setFormOpen(false)} food={selectedFood} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete food item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteFood.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteFood.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </Box>
  );
}
