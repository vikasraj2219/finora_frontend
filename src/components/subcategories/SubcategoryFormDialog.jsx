import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Box } from '@mui/material';
import { getIconComponent } from '../../utils/iconRegistry';

const EMPTY = { name: '', icon: '' };

const SubcategoryFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY });

  const previewIcon = useWatch({ control, name: 'icon' });
  const PreviewIcon = getIconComponent(previewIcon);

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
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Icon (Material icon name)"
                helperText="Optional — unrecognized names fall back to a generic icon"
                {...register('icon')}
                fullWidth
              />
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PreviewIcon fontSize="small" />
              </Box>
            </Stack>
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
