import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Box } from '@mui/material';

const EMPTY = { name: '', icon: '' };

const SubcategoryFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(initialValues ? { name: initialValues.name, icon: initialValues.icon || '' } : EMPTY);
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Subcategory Name"
              autoFocus
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
            <TextField label="Icon (Material icon name)" {...register('icon')} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Subcategory'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SubcategoryFormDialog;
