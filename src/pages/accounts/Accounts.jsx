import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined';
import QrCodeIcon from '@mui/icons-material/QrCode2Outlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BankAccountFormDialog from '../../components/accounts/BankAccountFormDialog';
import UpiAccountFormDialog from '../../components/accounts/UpiAccountFormDialog';
import CashAdjustDialog from '../../components/accounts/CashAdjustDialog';
import { formatCurrency } from '../../utils/formatters';

import {
  listBankAccounts,
  createBankAccount,
  updateBankAccount,
  toggleBankAccountActive,
  deleteBankAccount,
} from '../../api/bankAccountApi';
import {
  listUpiAccounts,
  createUpiAccount,
  updateUpiAccount,
  toggleUpiAccountActive,
  deleteUpiAccount,
} from '../../api/upiAccountApi';
import { getCashBalance, adjustCashBalance } from '../../api/cashApi';

const Accounts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);

  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);
  const [cash, setCash] = useState(null);

  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [editingUpi, setEditingUpi] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id }
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null); // { type, item }

  const loadAll = useCallback(async () => {
    const [bankRes, upiRes, cashRes] = await Promise.allSettled([
      listBankAccounts(),
      listUpiAccounts(),
      getCashBalance(),
    ]);

    if (bankRes.status === 'fulfilled') {
      setBankAccounts(bankRes.value.data.data.items);
    } else {
      enqueueSnackbar('Failed to load bank accounts', { variant: 'error' });
    }

    if (upiRes.status === 'fulfilled') {
      setUpiAccounts(upiRes.value.data.data.items);
    } else {
      enqueueSnackbar('Failed to load UPI accounts', { variant: 'error' });
    }

    if (cashRes.status === 'fulfilled') {
      setCash(cashRes.value.data.data);
    } else {
      enqueueSnackbar('Failed to load cash in hand', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMenu = (e, type, item) => {
    setMenuAnchor(e.currentTarget);
    setMenuTarget({ type, item });
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
  };

  const handleEdit = () => {
    if (menuTarget.type === 'bank') {
      setEditingBank(menuTarget.item);
      setBankDialogOpen(true);
    } else {
      setEditingUpi(menuTarget.item);
      setUpiDialogOpen(true);
    }
    closeMenu();
  };

  const handleToggleActive = async () => {
    try {
      if (menuTarget.type === 'bank') {
        await toggleBankAccountActive(menuTarget.item._id);
      } else {
        await toggleUpiAccountActive(menuTarget.item._id);
      }
      enqueueSnackbar('Status updated', { variant: 'success' });
      loadAll();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    }
    closeMenu();
  };

  const handleDeleteClick = () => {
    setDeleteTarget(menuTarget);
    closeMenu();
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'bank') {
        await deleteBankAccount(deleteTarget.item._id);
      } else {
        await deleteUpiAccount(deleteTarget.item._id);
      }
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      setDeleteTarget(null);
      loadAll();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  const submitBank = async (values) => {
    try {
      if (editingBank) {
        await updateBankAccount(editingBank._id, values);
      } else {
        await createBankAccount(values);
      }
      enqueueSnackbar(editingBank ? 'Bank account updated' : 'Bank account added', {
        variant: 'success',
      });
      setBankDialogOpen(false);
      setEditingBank(null);
      loadAll();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const submitUpi = async (values) => {
    try {
      if (editingUpi) {
        await updateUpiAccount(editingUpi._id, values);
      } else {
        await createUpiAccount(values);
      }
      enqueueSnackbar(editingUpi ? 'UPI account updated' : 'UPI account added', {
        variant: 'success',
      });
      setUpiDialogOpen(false);
      setEditingUpi(null);
      loadAll();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const submitCashAdjust = async (values) => {
    try {
      const { data } = await adjustCashBalance(values);
      setCash(data.data);
      enqueueSnackbar('Cash balance updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Adjustment failed', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Accounts"
        subtitle="Manage your bank accounts, UPI apps, and cash in hand"
        action={
          tab === 0 ? (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => {
                setEditingBank(null);
                setBankDialogOpen(true);
              }}
            >
              Add Bank Account
            </Button>
          ) : tab === 1 ? (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => {
                setEditingUpi(null);
                setUpiDialogOpen(true);
              }}
            >
              Add UPI Account
            </Button>
          ) : (
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCashDialogOpen(true)}>
              Adjust Cash
            </Button>
          )
        }
      />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Bank Accounts" />
        <Tab label="UPI Accounts" />
        <Tab label="Cash" />
      </Tabs>

      {tab === 0 &&
        (bankAccounts.length === 0 ? (
          <EmptyState
            icon={AccountBalanceIcon}
            title="No bank accounts yet"
            description="Add your first bank account to start tracking balances and transactions."
            actionLabel="Add Bank Account"
            onAction={() => setBankDialogOpen(true)}
          />
        ) : (
          <Grid container spacing={2}>
            {bankAccounts.map((acc) => (
              <Grid item xs={12} sm={6} lg={4} key={acc._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: `${acc.color}1A`,
                            color: acc.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AccountBalanceIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography fontWeight={600}>{acc.bankName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {acc.accountNickname || acc.accountType}
                            {acc.accountNumberLast4 ? ` •••• ${acc.accountNumberLast4}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={(e) => openMenu(e, 'bank', acc)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="h5" fontWeight={700} mt={2}>
                      {formatCurrency(acc.currentBalance, acc.currency)}
                    </Typography>
                    <Box mt={1.5}>
                      <StatusChip isActive={acc.isActive} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ))}

      {tab === 1 &&
        (upiAccounts.length === 0 ? (
          <EmptyState
            icon={QrCodeIcon}
            title="No UPI accounts yet"
            description="Add the UPI apps you use so transactions can be tagged accurately."
            actionLabel="Add UPI Account"
            onAction={() => setUpiDialogOpen(true)}
          />
        ) : (
          <Grid container spacing={2}>
            {upiAccounts.map((acc) => (
              <Grid item xs={12} sm={6} lg={4} key={acc._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: 'secondary.main',
                            opacity: 0.15,
                            position: 'absolute',
                          }}
                        />
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: 'rgba(201,162,39,0.12)',
                            color: 'secondary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <QrCodeIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography fontWeight={600}>{acc.nickname || acc.provider}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {acc.provider} {acc.upiId ? `· ${acc.upiId}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={(e) => openMenu(e, 'upi', acc)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box mt={2} display="flex" gap={1} alignItems="center" flexWrap="wrap">
                      {acc.linkedBankAccount && (
                        <Chip size="small" label={`Linked: ${acc.linkedBankAccount.bankName}`} />
                      )}
                      <StatusChip isActive={acc.isActive} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ))}

      {tab === 2 && (
        <Card sx={{ maxWidth: 420 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'rgba(34,197,94,0.12)',
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PaymentsIcon fontSize="small" />
              </Box>
              <Typography fontWeight={600}>Cash in Hand</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} mb={2}>
              {cash ? formatCurrency(cash.currentBalance, cash.currency) : '—'}
            </Typography>
            <Button variant="outlined" onClick={() => setCashDialogOpen(true)}>
              Adjust Balance
            </Button>
          </CardContent>
        </Card>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleToggleActive}>
          {menuTarget?.item?.isActive ? 'Mark Inactive' : 'Mark Active'}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <BankAccountFormDialog
        open={bankDialogOpen}
        initialValues={editingBank}
        onClose={() => {
          setBankDialogOpen(false);
          setEditingBank(null);
        }}
        onSubmit={submitBank}
      />

      <UpiAccountFormDialog
        open={upiDialogOpen}
        initialValues={editingUpi}
        bankAccounts={bankAccounts}
        onClose={() => {
          setUpiDialogOpen(false);
          setEditingUpi(null);
        }}
        onSubmit={submitUpi}
      />

      <CashAdjustDialog
        open={cashDialogOpen}
        currentBalance={cash ? formatCurrency(cash.currentBalance, cash.currency) : '—'}
        onClose={() => setCashDialogOpen(false)}
        onSubmit={submitCashAdjust}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this account?"
        description="This won't delete past transactions, but the account will no longer be usable."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default Accounts;
