import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
} from '@mui/material';
import { brand } from '../../theme/palette';
import { listTypes } from '../../api/typeApi';

const CategoryFormDialog = ({ open, onClose, onSubmit, initialValues, defaultType }) => {
  const isEdit = Boolean(initialValues);
  // Loaded from /types (appliesToCategory=true) instead of hardcoded income/expense, so
  // a custom category-eligible type added elsewhere shows up here automatically.
  const [types, setTypes] = useState([{ code: 'expense', label: 'Expense' }, { code: 'income', label: 'Income' }]);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', type: defaultType || 'expense', color: brand.teal } });

  useEffect(() => {
    if (!open) return;
    listTypes({ appliesToCategory: true })
      .then(({ data }) => {
        if (data.data?.length) setTypes(data.data.map((t) => ({ code: t.code, label: t.label })));
      })
      .catch(() => {
        // Keep the income/expense fallback above if the request fails.
      });
  }, [open]);

  useEffect(() => {
    if (open) {
      reset(initialValues || { name: '', type: defaultType || 'expense', color: brand.teal });
    }
  }, [open, initialValues, defaultType, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Category Name"
              autoFocus
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Type" fullWidth>
                  {types.map((t) => (
                    <MenuItem key={t.code} value={t.code}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField label="Color" type="color" {...register('color')} sx={{ width: 100 }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Category'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CategoryFormDialog;
