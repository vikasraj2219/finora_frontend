import { useEffect, useState, useCallback } from 'react';
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
  Chip,
  Typography,
} from '@mui/material';
import { listSubcategories } from '../../api/subcategoryApi';

const PAYMENT_METHODS = ['cash', 'bank', 'upi', 'card', 'other'];

const ALLOCATION_LABEL = {
  UNALLOCATED: { label: '🔴 Unallocated', color: 'error' },
  PARTIALLY_ALLOCATED: { label: '🟡 Partially Allocated', color: 'warning' },
  FULLY_ALLOCATED: { label: '🟢 Fully Allocated', color: 'success' },
};

const emptyDefaults = {
  type: 'expense',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'bank',
  category: '',
  subcategory: '',
  direction: 'decrease',
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
    subcategory: txn.subcategory?._id || '',
    direction: txn.direction || 'decrease',
    bankAccount: txn.bankAccount?._id || '',
    upiAccount: txn.upiAccount?._id || '',
    note: txn.note || '',
    fromType: txn.transferFrom?.type || 'bank',
    fromBankAccount: txn.transferFrom?.bankAccount?._id || '',
    toType: txn.transferTo?.type || 'bank',
    toBankAccount: txn.transferTo?.bankAccount?._id || '',
  };
};

// Covers income, expense, transfer, adjustment, and opening balance — fields
// conditionally shown based on `type`. Category/subcategory are optional: leaving them
// blank is valid (the transaction lands Unallocated/Partially Allocated and can be
// classified later from the allocation views).
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: emptyDefaults });

  const type = watch('type');
  const paymentMethod = watch('paymentMethod');
  const category = watch('category');
  const fromType = watch('fromType');
  const toType = watch('toType');

  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (open) reset(toFormValues(initialValues));
  }, [open, initialValues, reset]);

  const loadSubcategories = useCallback(async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    const { data } = await listSubcategories({ category: categoryId });
    setSubcategories(data.data);
  }, []);

  useEffect(() => {
    loadSubcategories(category);
    if (!isEdit || category !== initialValues?.category?._id) {
      setValue('subcategory', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const classifiable = !['transfer', 'adjustment', 'opening_balance'].includes(type);
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
      payload.paymentMethod = values.paymentMethod;
      if (values.paymentMethod === 'bank' && values.bankAccount) payload.bankAccount = values.bankAccount;
      if (values.paymentMethod === 'upi' && values.upiAccount) payload.upiAccount = values.upiAccount;

      if (values.type === 'adjustment') {
        payload.direction = values.direction;
      }

      if (classifiable) {
        if (values.category) payload.category = values.category;
        if (values.subcategory) payload.subcategory = values.subcategory;
      }
    }

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Transaction' : 'Add Transaction'}
        {isEdit && initialValues?.allocationStatus && (
          <Chip
            size="small"
            sx={{ ml: 1.5 }}
            label={ALLOCATION_LABEL[initialValues.allocationStatus]?.label}
            color={ALLOCATION_LABEL[initialValues.allocationStatus]?.color}
          />
        )}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(submitHandler)}>
        <DialogContent>
          <Stack spacing={2.5} mt={0.5}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  {...field}
                  exclusive
                  fullWidth
                  onChange={(e, v) => v && field.onChange(v)}
                  sx={{ flexWrap: 'wrap' }}
                >
                  <ToggleButton value="expense">Expense</ToggleButton>
                  <ToggleButton value="income">Income</ToggleButton>
                  <ToggleButton value="transfer">Transfer</ToggleButton>
                  <ToggleButton value="adjustment">Adjustment</ToggleButton>
                  <ToggleButton value="opening_balance">Opening Balance</ToggleButton>
                </ToggleButtonGroup>
              )}
            />

            {isEdit && initialValues?.typeAllocated === false && (
              <Typography variant="caption" color="warning.main">
                This type was auto-detected from the import, not yet confirmed by you — saving this form
                confirms it.
              </Typography>
            )}

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

            {type === 'adjustment' && (
              <Controller
                name="direction"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Direction" fullWidth>
                    <MenuItem value="increase">Increase balance</MenuItem>
                    <MenuItem value="decrease">Decrease balance</MenuItem>
                  </TextField>
                )}
              />
            )}

            {type !== 'transfer' ? (
              <>
                {classifiable && (
                  <>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="Category (optional)" fullWidth>
                          <MenuItem value="">
                            <em>Leave unallocated</em>
                          </MenuItem>
                          {filteredCategories.map((c) => (
                            <MenuItem key={c._id} value={c._id}>
                              {c.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                    {category && (
                      <Controller
                        name="subcategory"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label={subcategories.length ? 'Subcategory' : 'Subcategory (none for this category)'}
                            fullWidth
                            disabled={subcategories.length === 0}
                          >
                            <MenuItem value="">
                              <em>{subcategories.length ? 'Leave unallocated' : 'No subcategories'}</em>
                            </MenuItem>
                            {subcategories.map((s) => (
                              <MenuItem key={s._id} value={s._id}>
                                {s.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    )}
                  </>
                )}
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

            {classifiable && !category && (
              <Typography variant="caption" color="text.secondary">
                No category selected — this transaction will be marked Unallocated until you classify it.
              </Typography>
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
