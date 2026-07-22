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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';

const PAYMENT_METHODS = ['cash', 'bank', 'upi', 'card', 'other'];

const emptyDefaults = {
  type: 'expense',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'bank',
  category: '',
  bankAccount: '',
  upiAccount: '',
  note: '',
  fromType: 'bank',
  fromBankAccount: '',
  toType: 'bank',
  toBankAccount: '',
};

const toFormValues = (txn) => {
  if (!txn) return emptyDefaults;
  return {
    type: txn.type,
    amount: txn.amount,
    date: new Date(txn.date).toISOString().slice(0, 10),
    paymentMethod: txn.paymentMethod || 'bank',
    category: txn.category?._id || '',
    bankAccount: txn.bankAccount?._id || '',
    upiAccount: txn.upiAccount?._id || '',
    note: txn.note || '',
    fromType: txn.transferFrom?.type || 'bank',
    fromBankAccount: txn.transferFrom?.bankAccount?._id || '',
    toType: txn.transferTo?.type || 'bank',
    toBankAccount: txn.transferTo?.bankAccount?._id || '',
  };
};

// One form covers income, expense, and transfer — fields conditionally shown based on `type`.
const TransactionFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  categories,
  bankAccounts,
  upiAccounts,
}) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: emptyDefaults });

  const type = watch('type');
  const paymentMethod = watch('paymentMethod');
  const fromType = watch('fromType');
  const toType = watch('toType');

  useEffect(() => {
    if (open) reset(toFormValues(initialValues));
  }, [open, initialValues, reset]);

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  const submitHandler = async (values) => {
    const payload = {
      type: values.type,
      amount: Number(values.amount),
      date: values.date,
      note: values.note || undefined,
    };

    if (values.type === 'transfer') {
      payload.transferFrom = {
        type: values.fromType,
        bankAccount: values.fromType === 'bank' ? values.fromBankAccount : undefined,
      };
      payload.transferTo = {
        type: values.toType,
        bankAccount: values.toType === 'bank' ? values.toBankAccount : undefined,
      };
    } else {
      payload.category = values.category;
      payload.paymentMethod = values.paymentMethod;
      if (values.paymentMethod === 'bank' && values.bankAccount) payload.bankAccount = values.bankAccount;
      if (values.paymentMethod === 'upi' && values.upiAccount) payload.upiAccount = values.upiAccount;
    }

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(submitHandler)}>
        <DialogContent>
          <Stack spacing={2.5} mt={0.5}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup {...field} exclusive fullWidth onChange={(e, v) => v && field.onChange(v)}>
                  <ToggleButton value="expense">Expense</ToggleButton>
                  <ToggleButton value="income">Income</ToggleButton>
                  <ToggleButton value="transfer">Transfer</ToggleButton>
                </ToggleButtonGroup>
              )}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Amount"
                type="number"
                {...register('amount', { required: 'Amount is required' })}
                error={!!errors.amount}
                helperText={errors.amount?.message}
                fullWidth
              />
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register('date', { required: 'Date is required' })}
                fullWidth
              />
            </Stack>

            {type !== 'transfer' ? (
              <>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Category"
                      error={!!errors.category}
                      helperText={errors.category?.message}
                      fullWidth
                    >
                      {filteredCategories.map((c) => (
                        <MenuItem key={c._id} value={c._id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Payment Method" fullWidth>
                      {PAYMENT_METHODS.map((m) => (
                        <MenuItem key={m} value={m}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                {paymentMethod === 'bank' && (
                  <Controller
                    name="bankAccount"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Bank Account" fullWidth>
                        <MenuItem value="">Select account</MenuItem>
                        {bankAccounts.map((b) => (
                          <MenuItem key={b._id} value={b._id}>
                            {b.bankName} {b.accountNickname ? `— ${b.accountNickname}` : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}
                {paymentMethod === 'upi' && (
                  <Controller
                    name="upiAccount"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="UPI Account" fullWidth>
                        <MenuItem value="">Select account</MenuItem>
                        {upiAccounts.map((u) => (
                          <MenuItem key={u._id} value={u._id}>
                            {u.nickname || u.provider}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}
              </>
            ) : (
              <>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Controller
                    name="fromType"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="From" fullWidth>
                        <MenuItem value="bank">Bank Account</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                      </TextField>
                    )}
                  />
                  {fromType === 'bank' && (
                    <Controller
                      name="fromBankAccount"
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <TextField {...field} select label="From Bank" fullWidth error={!!errors.fromBankAccount}>
                          {bankAccounts.map((b) => (
                            <MenuItem key={b._id} value={b._id}>
                              {b.bankName}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  )}
                </Stack>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Controller
                    name="toType"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="To" fullWidth>
                        <MenuItem value="bank">Bank Account</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                      </TextField>
                    )}
                  />
                  {toType === 'bank' && (
                    <Controller
                      name="toBankAccount"
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <TextField {...field} select label="To Bank" fullWidth error={!!errors.toBankAccount}>
                          {bankAccounts.map((b) => (
                            <MenuItem key={b._id} value={b._id}>
                              {b.bankName}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  )}
                </Stack>
              </>
            )}

            <TextField label="Note (optional)" {...register('note')} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TransactionFormDialog;
