import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';

const EMPTY = { code: '', label: '', appliesToCategory: false, icon: '', color: '#64748B' };

const TypeFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      initialValues
        ? {
            code: initialValues.code,
            label: initialValues.label,
            appliesToCategory: Boolean(initialValues.appliesToCategory),
            icon: initialValues.icon || '',
            color: initialValues.color || '#64748B',
          }
        : EMPTY
    );
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Type' : 'Add Type'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Code"
              autoFocus={!isEdit}
              disabled={isEdit}
              {...register('code', {
                required: 'Code is required',
                pattern: {
                  value: /^[a-z][a-z_]*$/,
                  message: 'Lowercase letters and underscores only, e.g. "refund"',
                },
              })}
              error={!!errors.code}
              helperText={isEdit ? "Code can't be changed after creation" : errors.code?.message}
              fullWidth
            />
            <TextField
              label="Label"
              {...register('label', { required: 'Label is required' })}
              error={!!errors.label}
              helperText={errors.label?.message}
              fullWidth
            />
            <Controller
              name="appliesToCategory"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Usable as a Category type (like Income / Expense)"
                />
              )}
            />
            <TextField label="Icon (Material icon name)" {...register('icon')} fullWidth />
            <TextField label="Color" type="color" {...register('color')} sx={{ width: 100 }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Type'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TypeFormDialog;
