import { useEffect } from 'react';
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

const MerchantFormDialog = ({ open, onClose, onSubmit, initialValues, categories }) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', defaultCategory: '' } });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? { name: initialValues.name, defaultCategory: initialValues.defaultCategory?._id || '' }
          : { name: '', defaultCategory: '' }
      );
    }
  }, [open, initialValues, reset]);

  const submitHandler = async (values) => {
    const payload = { name: values.name };
    if (values.defaultCategory) payload.defaultCategory = values.defaultCategory;
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Merchant' : 'Add Merchant'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(submitHandler)}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Merchant Name"
              autoFocus
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
            <Controller
              name="defaultCategory"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Default Category (optional)" fullWidth>
                  <MenuItem value="">None</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Merchant'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default MerchantFormDialog;
