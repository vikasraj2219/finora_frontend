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

const ACCOUNT_TYPES = ['savings', 'current', 'salary', 'other'];

const BankAccountFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bankName: '',
      accountNickname: '',
      accountNumberLast4: '',
      accountType: 'savings',
      openingBalance: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues || {
          bankName: '',
          accountNickname: '',
          accountNumberLast4: '',
          accountType: 'savings',
          openingBalance: 0,
        }
      );
    }
  }, [open, initialValues, reset]);

  const submitHandler = async (values) => {
    await onSubmit({ ...values, openingBalance: Number(values.openingBalance) || 0 });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(submitHandler)}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Bank Name"
              {...register('bankName', { required: 'Bank name is required' })}
              error={!!errors.bankName}
              helperText={errors.bankName?.message}
              fullWidth
            />
            <TextField label="Nickname (optional)" {...register('accountNickname')} fullWidth />
            <Stack direction="row" spacing={2}>
              <Controller
                name="accountType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Account Type" fullWidth>
                    {ACCOUNT_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                label="Last 4 Digits"
                {...register('accountNumberLast4')}
                fullWidth
              />
            </Stack>
            <TextField
              label={isEdit ? 'Opening Balance (locked after creation)' : 'Opening Balance'}
              type="number"
              disabled={isEdit}
              {...register('openingBalance')}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Account'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default BankAccountFormDialog;
