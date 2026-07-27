import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingDownIcon from '@mui/icons-material/TrendingDownOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHorizOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2Outlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHorizOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NorthIcon from '@mui/icons-material/NorthOutlined';
import SouthIcon from '@mui/icons-material/SouthOutlined';
import { listSubcategories } from '../../api/subcategoryApi';

const TYPE_META = {
  expense: { label: 'Expense', icon: TrendingDownIcon, color: 'error' },
  income: { label: 'Income', icon: TrendingUpIcon, color: 'success' },
  transfer: { label: 'Transfer', icon: SwapHorizIcon, color: 'info' },
  adjustment: { label: 'Adjustment', icon: TuneIcon, color: 'warning' },
  opening_balance: { label: 'Opening Balance', icon: AccountBalanceWalletIcon, color: 'primary' },
};

const PAYMENT_META = {
  cash: { label: 'Cash', icon: PaymentsIcon },
  bank: { label: 'Bank', icon: AccountBalanceIcon },
  upi: { label: 'UPI', icon: QrCode2Icon },
  card: { label: 'Card', icon: CreditCardIcon },
  other: { label: 'Other', icon: MoreHorizIcon },
};

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

// A small colored dot used to echo a category's color in its select option/value —
// the same visual language Categories.jsx uses for its cards.
const ColorDot = ({ color }) => (
  <Box
    component="span"
    sx={{
      width: 9,
      height: 9,
      borderRadius: '50%',
      bgcolor: color || '#94A3B8',
      display: 'inline-block',
      flexShrink: 0,
    }}
  />
);

// One selectable tile in the type row — the primary entry point to the form, so it
// carries the most visual weight: filled + colored when selected, quiet outline
// otherwise.
const TypeTile = ({ value, meta, selected, onSelect }) => {
  const Icon = meta.icon;
  return (
    <Box
      onClick={() => onSelect(value)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(value)}
      sx={{
        flex: '1 1 0',
        minWidth: 96,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        py: 1.25,
        px: 1,
        borderRadius: 2.5,
        border: '1.5px solid',
        borderColor: selected ? `${meta.color}.main` : 'divider',
        bgcolor: selected ? `${meta.color}.main` : 'transparent',
        color: selected ? `${meta.color}.contrastText` : 'text.secondary',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: `${meta.color}.main`,
          bgcolor: selected ? `${meta.color}.main` : 'action.hover',
        },
      }}
    >
      <Icon fontSize="small" />
      <Typography variant="caption" fontWeight={600} textAlign="center" lineHeight={1.2}>
        {meta.label}
      </Typography>
    </Box>
  );
};

// Compact icon tile for payment method — same visual language as TypeTile, smaller.
const MethodTile = ({ value, meta, selected, onSelect }) => {
  const Icon = meta.icon;
  return (
    <Box
      onClick={() => onSelect(value)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(value)}
      sx={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        py: 1,
        borderRadius: 2,
        border: '1.5px solid',
        borderColor: selected ? 'secondary.main' : 'divider',
        bgcolor: selected ? 'secondary.main' : 'transparent',
        color: selected ? 'secondary.contrastText' : 'text.secondary',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: 'secondary.main' },
      }}
    >
      <Icon fontSize="small" />
      <Typography variant="caption" fontWeight={600}>
        {meta.label}
      </Typography>
    </Box>
  );
};

const SectionLabel = ({ children, action }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
    <Typography variant="overline" color="text.secondary" letterSpacing={0.8}>
      {children}
    </Typography>
    {action}
  </Stack>
);

// Covers income, expense, transfer, adjustment, and opening balance in one form —
// fields conditionally shown based on `type`. Category/subcategory are optional:
// leaving them blank is valid, and the live badge above the Classify section shows
// exactly what that means for this transaction's allocation status.
const TransactionFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  categories,
  bankAccounts,
  upiAccounts,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
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

  const classifiable = type === 'income' || type === 'expense';
  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCategory = filteredCategories.find((c) => c._id === category);
  const subcategory = watch('subcategory');

  // Mirrors the backend's allocationStatus rule exactly: submitting this form always
  // confirms the type (that's the one thing a manual entry always has), so the live
  // preview is 1 (type) + category + subcategory out of 3.
  const setCount = classifiable ? 1 + (category ? 1 : 0) + (subcategory ? 1 : 0) : 3;
  const livePreview = !classifiable
    ? 'FULLY_ALLOCATED'
    : setCount === 3
    ? 'FULLY_ALLOCATED'
    : setCount === 0
    ? 'UNALLOCATED'
    : 'PARTIALLY_ALLOCATED';

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

  const accentColor = TYPE_META[type]?.color || 'primary';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 4, overflow: 'hidden' } }}
    >
      {/* Accent bar echoes the selected type's color — a small, quiet signature that
          makes the form feel alive as you switch type, without adding decoration. */}
      <Box sx={{ height: 4, bgcolor: `${accentColor}.main`, transition: 'background-color 0.2s ease' }} />

      <Box sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </Typography>
          {isEdit && initialValues?.allocationStatus && (
            <Chip
              size="small"
              sx={{ mt: 0.5 }}
              label={ALLOCATION_LABEL[initialValues.allocationStatus]?.label}
              color={ALLOCATION_LABEL[initialValues.allocationStatus]?.color}
              variant="outlined"
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box component="form" onSubmit={handleSubmit(submitHandler)} sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <DialogContent sx={{ px: 3, pt: 0.5 }}>
          <Stack spacing={3}>
            <Box>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {Object.entries(TYPE_META).map(([value, meta]) => (
                      <TypeTile
                        key={value}
                        value={value}
                        meta={meta}
                        selected={field.value === value}
                        onSelect={field.onChange}
                      />
                    ))}
                  </Stack>
                )}
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Amount"
                type="number"
                autoFocus
                inputProps={{ step: '0.01', min: '0' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  sx: { fontSize: '1.5rem', fontWeight: 700, fontFamily: '"Manrope", sans-serif' },
                }}
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
                sx={{ maxWidth: 170 }}
              />
            </Stack>

            {type === 'adjustment' && (
              <Box>
                <SectionLabel>Direction</SectionLabel>
                <Controller
                  name="direction"
                  control={control}
                  render={({ field }) => (
                    <Stack direction="row" spacing={1.5}>
                      {[
                        { value: 'increase', label: 'Increase balance', icon: NorthIcon, color: 'success' },
                        { value: 'decrease', label: 'Decrease balance', icon: SouthIcon, color: 'error' },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        const selected = field.value === opt.value;
                        return (
                          <Box
                            key={opt.value}
                            onClick={() => field.onChange(opt.value)}
                            sx={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                              border: '1.5px solid',
                              borderColor: selected ? `${opt.color}.main` : 'divider',
                              bgcolor: selected ? `${opt.color}.main` : 'transparent',
                              color: selected ? `${opt.color}.contrastText` : 'text.secondary',
                              cursor: 'pointer',
                            }}
                          >
                            <Icon fontSize="small" />
                            <Typography variant="body2" fontWeight={600}>
                              {opt.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                />
              </Box>
            )}

            {type !== 'transfer' ? (
              <>
                {classifiable && (
                  <Box>
                    <SectionLabel
                      action={
                        <Chip
                          size="small"
                          label={ALLOCATION_LABEL[livePreview].label}
                          color={ALLOCATION_LABEL[livePreview].color}
                          variant="outlined"
                        />
                      }
                    >
                      Classify
                    </SectionLabel>
                    <Stack spacing={1.5}>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Category"
                            fullWidth
                            SelectProps={{
                              renderValue: (val) => {
                                if (!val) return <Typography color="text.secondary">Not set — leave unallocated</Typography>;
                                const c = filteredCategories.find((x) => x._id === val);
                                return (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <ColorDot color={c?.color} />
                                    <span>{c?.name}</span>
                                  </Stack>
                                );
                              },
                            }}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Leave unallocated</em>
                            </MenuItem>
                            {filteredCategories.map((c) => (
                              <MenuItem key={c._id} value={c._id}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <ColorDot color={c.color} />
                                  <span>{c.name}</span>
                                </Stack>
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
                    </Stack>
                  </Box>
                )}

                <Box>
                  <SectionLabel>Paid With</SectionLabel>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <Stack direction="row" spacing={1}>
                        {Object.entries(PAYMENT_META).map(([value, meta]) => (
                          <MethodTile
                            key={value}
                            value={value}
                            meta={meta}
                            selected={field.value === value}
                            onSelect={field.onChange}
                          />
                        ))}
                      </Stack>
                    )}
                  />
                  {paymentMethod === 'bank' && (
                    <Controller
                      name="bankAccount"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="Bank Account" fullWidth sx={{ mt: 1.5 }}>
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
                        <TextField {...field} select label="UPI Account" fullWidth sx={{ mt: 1.5 }}>
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
                </Box>
              </>
            ) : (
              <Box>
                <SectionLabel>Route</SectionLabel>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Stack spacing={1.5} flex={1}>
                    <Controller
                      name="fromType"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="From" fullWidth size="small">
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
                          <TextField {...field} select label="From Bank" fullWidth size="small" error={!!errors.fromBankAccount}>
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

                  <ArrowForwardIcon
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      color: 'info.main',
                      transform: 'rotate(0deg)',
                    }}
                  />

                  <Stack spacing={1.5} flex={1}>
                    <Controller
                      name="toType"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="To" fullWidth size="small">
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
                          <TextField {...field} select label="To Bank" fullWidth size="small" error={!!errors.toBankAccount}>
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
                </Stack>
              </Box>
            )}

            <Divider sx={{ opacity: 0.6 }} />

            <TextField
              label="Note (optional)"
              placeholder="What was this for?"
              {...register('note')}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color={accentColor === 'default' ? 'primary' : accentColor} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TransactionFormDialog;
