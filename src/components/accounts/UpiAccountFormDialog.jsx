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

const PROVIDERS = ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'AmazonPay', 'Other'];

const UpiAccountFormDialog = ({ open, onClose, onSubmit, initialValues, bankAccounts }) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { provider: 'GPay', upiId: '', nickname: '', linkedBankAccount: '' },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialValues
          ? { ...initialValues, linkedBankAccount: initialValues.linkedBankAccount?._id || '' }
          : { provider: 'GPay', upiId: '', nickname: '', linkedBankAccount: '' }
      );
    }
  }, [open, initialValues, reset]);

  const submitHandler = async (values) => {
    const payload = { ...values };
    if (!payload.linkedBankAccount) delete payload.linkedBankAccount;
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit UPI Account' : 'Add UPI Account'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(submitHandler)}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <Controller
              name="provider"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Provider" fullWidth>
                  {PROVIDERS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField label="UPI ID (optional)" {...register('upiId')} fullWidth placeholder="name@bank" />
            <TextField label="Nickname (optional)" {...register('nickname')} fullWidth />
            <Controller
              name="linkedBankAccount"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Linked Bank Account (optional)" fullWidth>
                  <MenuItem value="">None</MenuItem>
                  {bankAccounts.map((b) => (
                    <MenuItem key={b._id} value={b._id}>
                      {b.bankName} {b.accountNickname ? `— ${b.accountNickname}` : ''}
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
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Account'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default UpiAccountFormDialog;
