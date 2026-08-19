import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { foodSchema, type FoodFormValues } from '@/schemas/foodSchemas';
import { VariantsEditor } from './VariantsEditor';
import { AddOnsEditor } from './AddOnsEditor';
import { MultiImageUploader } from '@/components/common/MultiImageUploader';
import { useCategories } from '@/hooks/useCategories';
import {
  useCreateFood,
  useRemoveFoodImage,
  useUpdateFood,
  useUploadFoodImages,
} from '@/hooks/useFoods';
import type { FoodItem } from '@/types';

interface FoodFormDialogProps {
  open: boolean;
  onClose: () => void;
  food?: FoodItem | null;
  defaultCategoryId?: string;
}

const defaultValues: FoodFormValues = {
  categoryId: '',
  name: '',
  description: '',
  price: 0,
  discountPercent: 0,
  isVeg: true,
  isAvailable: true,
  variants: [],
  addOns: [],
  tags: [],
};

export function FoodFormDialog({ open, onClose, food, defaultCategoryId }: FoodFormDialogProps) {
  const { data: categories } = useCategories();
  const createFood = useCreateFood();
  const updateFood = useUpdateFood();
  const uploadImages = useUploadFoodImages();
  const removeImage = useRemoveFoodImage();

  const [createdFood, setCreatedFood] = useState<FoodItem | null>(null);
  const activeFood = food ?? createdFood;
  const isEditing = Boolean(activeFood);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FoodFormValues>({
    resolver: zodResolver(foodSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      setCreatedFood(null);
      reset(food ? mapFoodToForm(food) : { ...defaultValues, categoryId: defaultCategoryId ?? '' });
    }
  }, [open, food, defaultCategoryId, reset]);

  async function onSubmit(values: FoodFormValues) {
    if (activeFood) {
      const updated = await updateFood.mutateAsync({ id: activeFood.id, payload: values });
      setCreatedFood(updated);
    } else {
      const created = await createFood.mutateAsync(values);
      setCreatedFood(created);
    }
  }

  function handleClose() {
    onClose();
  }

  const isSaving = createFood.isPending || updateFood.isPending;
  const tagsValue = watch('tags');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {food ? 'Edit food item' : 'Add food item'}
        <IconButton onClick={handleClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Food name"
                fullWidth
                autoFocus
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Category"
                select
                fullWidth
                error={Boolean(errors.categoryId)}
                helperText={errors.categoryId?.message}
                {...register('categoryId')}
              >
                {categories?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={2}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                {...register('description')}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Price (₹)"
                type="number"
                fullWidth
                error={Boolean(errors.price)}
                helperText={errors.price?.message}
                {...register('price')}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Discount (%)"
                type="number"
                fullWidth
                error={Boolean(errors.discountPercent)}
                helperText={errors.discountPercent?.message}
                {...register('discountPercent')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={watch('isVeg')}
                      onChange={(_, checked) => setValue('isVeg', checked, { shouldDirty: true })}
                    />
                  }
                  label="Veg"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={watch('isAvailable')}
                      onChange={(_, checked) => setValue('isAvailable', checked, { shouldDirty: true })}
                    />
                  }
                  label="Available"
                />
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Tags (comma separated, e.g. bestseller, spicy)"
                fullWidth
                value={tagsValue?.join(', ') ?? ''}
                onChange={(e) =>
                  setValue(
                    'tags',
                    e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                    { shouldDirty: true }
                  )
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <VariantsEditor control={control} register={register} errors={errors} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <AddOnsEditor control={control} register={register} errors={errors} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Images
              </Typography>
              {activeFood ? (
                <MultiImageUploader
                  images={activeFood.images ?? []}
                  isUploading={uploadImages.isPending}
                  onAdd={(files) =>
                    uploadImages.mutate(
                      { id: activeFood.id, files },
                      {
                        onSuccess: (updated) => setCreatedFood(updated),
                      }
                    )
                  }
                  onRemove={(imageUrl) =>
                    removeImage.mutate(
                      { id: activeFood.id, imageUrl },
                      { onSuccess: (updated) => setCreatedFood(updated) }
                    )
                  }
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Save the item first, then you can upload photos.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit">
            {isEditing ? 'Done' : 'Cancel'}
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create item'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}

function mapFoodToForm(food: FoodItem): FoodFormValues {
  return {
    categoryId: food.categoryId,
    name: food.name,
    description: food.description ?? '',
    price: food.price,
    discountPercent: food.discountPercent ?? 0,
    isVeg: food.isVeg,
    isAvailable: food.isAvailable,
    variants: food.variants ?? [],
    addOns: food.addOns ?? [],
    tags: food.tags ?? [],
  };
}
