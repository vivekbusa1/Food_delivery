import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { categorySchema, type CategoryFormValues } from '@/schemas/foodSchemas';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import type { FoodCategory } from '@/types';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  category?: FoodCategory | null;
}

const defaultValues: CategoryFormValues = { name: '', description: '', isActive: true };

export function CategoryFormDialog({ open, onClose, category }: CategoryFormDialogProps) {
  const isEditing = Boolean(category);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        category
          ? { name: category.name, description: category.description ?? '', isActive: category.isActive }
          : defaultValues
      );
    }
  }, [open, category, reset]);

  async function onSubmit(values: CategoryFormValues) {
    if (isEditing && category) {
      await updateCategory.mutateAsync({ id: category.id, payload: values });
    } else {
      await createCategory.mutateAsync(values);
    }
    onClose();
  }

  const isSaving = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Edit category' : 'Add category'}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5}>
            <TextField
              label="Category name"
              fullWidth
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              minRows={2}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              {...register('description')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={watch('isActive')}
                  onChange={(_, checked) => setValue('isActive', checked, { shouldDirty: true })}
                />
              }
              label="Active (visible to customers)"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add category'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
