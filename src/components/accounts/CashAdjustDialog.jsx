import { useForm } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Box, Typography } from '@mui/material';

const CashAdjustDialog = ({ open, onClose, onSubmit, currentBalance }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { amount: '', note: '' } });

  const close = () => {
    reset({ amount: '', note: '' });
    onClose();
  };

  const submitHandler = async (values) => {
    await onSubmit({ amount: Number(values.amount), note: values.note });
    close();
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle>Adjust Cash Balance</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(submitHandler)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Current balance: <strong>{currentBalance}</strong>. Use a positive amount to add cash,
            negative to record cash spent or withdrawn.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Amount"
              type="number"
              autoFocus
              {...register('amount', { required: 'Amount is required' })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              fullWidth
            />
            <TextField label="Note (optional)" {...register('note')} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Adjust'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CashAdjustDialog;
