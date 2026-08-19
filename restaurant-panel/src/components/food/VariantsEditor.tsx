import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import type { FoodFormValues } from '@/schemas/foodSchemas';

interface VariantsEditorProps {
  control: Control<FoodFormValues>;
  register: UseFormRegister<FoodFormValues>;
  errors: FieldErrors<FoodFormValues>;
}

export function VariantsEditor({ control, register, errors }: VariantsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Variants (e.g. Half / Full, Small / Medium / Large)
        </Typography>
        <Button
          size="small"
          startIcon={<AddRoundedIcon fontSize="small" />}
          onClick={() => append({ name: '', price: 0 })}
        >
          Add variant
        </Button>
      </Stack>

      {fields.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No variants added. The base price will be used.
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
              error={Boolean(errors.variants?.[index]?.name)}
              helperText={errors.variants?.[index]?.name?.message}
              {...register(`variants.${index}.name` as const)}
            />
            <TextField
              label="Price (₹)"
              size="small"
              type="number"
              sx={{ width: 140 }}
              defaultValue={field.price}
              error={Boolean(errors.variants?.[index]?.price)}
              helperText={errors.variants?.[index]?.price?.message}
              {...register(`variants.${index}.price` as const)}
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
