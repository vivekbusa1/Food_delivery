import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import type { FoodFormValues } from '@/schemas/foodSchemas';

interface AddOnsEditorProps {
  control: Control<FoodFormValues>;
  register: UseFormRegister<FoodFormValues>;
  errors: FieldErrors<FoodFormValues>;
}

export function AddOnsEditor({ control, register, errors }: AddOnsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'addOns' });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Add-ons (e.g. Extra cheese, Extra spicy)
        </Typography>
        <Button
          size="small"
          startIcon={<AddRoundedIcon fontSize="small" />}
          onClick={() => append({ name: '', price: 0 })}
        >
          Add add-on
        </Button>
      </Stack>

      {fields.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No add-ons added for this item.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {fields.map((field, index) => (
          <Stack key={field.id} direction="row" spacing={1.5} alignItems="flex-start">
            <TextField
              label="Name"
              size="small"
              fullWidth
              defaultValue={field.name}
              error={Boolean(errors.addOns?.[index]?.name)}
              helperText={errors.addOns?.[index]?.name?.message}
              {...register(`addOns.${index}.name` as const)}
            />
            <TextField
              label="Price (₹)"
              size="small"
              type="number"
              sx={{ width: 140 }}
              defaultValue={field.price}
              error={Boolean(errors.addOns?.[index]?.price)}
              helperText={errors.addOns?.[index]?.price?.message}
              {...register(`addOns.${index}.price` as const)}
            />
            <IconButton color="error" size="small" onClick={() => remove(index)} sx={{ mt: 0.5 }}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
