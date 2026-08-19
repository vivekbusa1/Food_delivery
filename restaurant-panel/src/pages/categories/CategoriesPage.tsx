import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog';
import { useCategories, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories';
import type { FoodCategory } from '@/types';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; category: FoodCategory } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FoodCategory | null>(null);

  function openCreate() {
    setSelectedCategory(null);
    setFormOpen(true);
  }

  function openEdit(category: FoodCategory) {
    setSelectedCategory(category);
    setFormOpen(true);
    setMenuAnchor(null);
  }

  return (
    <Box>
      <PageHeader
        title="Food Categories"
        description="Organize your menu into categories customers can browse."
        actions={
          <Chip
            icon={<AddRoundedIcon />}
            label="Add category"
            color="primary"
            onClick={openCreate}
            sx={{ px: 1, cursor: 'pointer' }}
          />
        }
      />

      {isLoading && (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      )}

      {!isLoading && (categories?.length ?? 0) === 0 && (
        <EmptyState
          title="No categories yet"
          description="Create your first category to start organizing your menu."
          icon={<CategoryRoundedIcon fontSize="inherit" />}
          actionLabel="Add category"
          onAction={openCreate}
        />
      )}

      <Grid container spacing={2}>
        {categories?.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.itemCount ?? 0} items
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => setMenuAnchor({ el: e.currentTarget, category })}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {category.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {category.description}
                  </Typography>
                )}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                  <Chip
                    size="small"
                    label={category.isActive ? 'Active' : 'Hidden'}
                    color={category.isActive ? 'success' : 'default'}
                  />
                  <Switch
                    size="small"
                    checked={category.isActive}
                    onChange={(_, checked) =>
                      updateCategory.mutate({ id: category.id, payload: { isActive: checked } })
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuAnchor && openEdit(menuAnchor.category)}>Edit</MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            if (menuAnchor) setDeleteTarget(menuAnchor.category);
            setMenuAnchor(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <CategoryFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={selectedCategory}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Food items in this category will need to be reassigned.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteCategory.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteCategory.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </Box>
  );
}
