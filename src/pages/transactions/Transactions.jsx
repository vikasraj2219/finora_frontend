import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  Typography,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHorizOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFileOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TransactionFormDialog from '../../components/transactions/TransactionFormDialog';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import ReceiptDialog from '../../components/transactions/ReceiptDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';

import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../api/transactionApi';
import { listCategories } from '../../api/categoryApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listUpiAccounts } from '../../api/upiAccountApi';

const TYPE_COLOR = { income: 'success', expense: 'error', transfer: 'info' };

const describeTransaction = (t) => {
  if (t.type === 'transfer') {
    const from = t.transferFrom?.type === 'cash' ? 'Cash' : t.transferFrom?.bankAccount?.bankName || '—';
    const to = t.transferTo?.type === 'cash' ? 'Cash' : t.transferTo?.bankAccount?.bankName || '—';
    return `${from} → ${to}`;
  }
  return t.category?.name || '—';
};

const Transactions = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, pageSize: 10 });
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [receiptTarget, setReceiptTarget] = useState(null);

  const loadLookups = useCallback(async () => {
    const [catRes, bankRes, upiRes] = await Promise.all([
      listCategories(),
      listBankAccounts(),
      listUpiAccounts(),
    ]);
    setCategories(catRes.data.data);
    setBankAccounts(bankRes.data.data.items);
    setUpiAccounts(upiRes.data.data.items);
  }, []);

  const loadTransactions = useCallback(async () => {
    const { data } = await listTransactions(filters);
    setRows(data.data.items);
    setMeta(data.data.meta);
  }, [filters]);

  useEffect(() => {
    loadLookups().catch(() => enqueueSnackbar('Failed to load accounts/categories', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTransactions().catch(() => enqueueSnackbar('Failed to load transactions', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const submit = async (payload) => {
    try {
      if (editing) {
        await updateTransaction(editing._id, payload);
        enqueueSnackbar('Transaction updated', { variant: 'success' });
      } else {
        await createTransaction(payload);
        enqueueSnackbar('Transaction recorded', { variant: 'success' });
      }
      setDialogOpen(false);
      setEditing(null);
      loadTransactions();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(deleteTarget._id);
      enqueueSnackbar('Transaction deleted', { variant: 'success' });
      setDeleteTarget(null);
      loadTransactions();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  const handleReceiptUpdated = (updatedTxn) => {
    setRows((prev) => prev.map((r) => (r._id === updatedTxn._id ? { ...r, receiptUrl: updatedTxn.receiptUrl } : r)));
    setReceiptTarget((prev) => (prev ? { ...prev, receiptUrl: updatedTxn.receiptUrl } : prev));
  };

  return (
    <Box>
      <PageHeader
        title="Transactions"
        subtitle="Every income, expense, and transfer in one place"
        action={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add Transaction
          </Button>
        }
      />

      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onClear={() => setFilters({ page: 1, limit: 10 })}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={SwapHorizIcon}
          title="No transactions found"
          description="Add your first transaction, or adjust your filters."
          actionLabel="Add Transaction"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <>
          {/* Desktop: full table. Mobile: stacked cards — avoids horizontal scrolling on small screens. */}
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category / Route</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t._id} hover>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.type} color={TYPE_COLOR[t.type]} variant="outlined" />
                    </TableCell>
                    <TableCell>{describeTransaction(t)}</TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" noWrap>
                        {t.note || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight={600}
                        color={t.type === 'income' ? 'success.main' : t.type === 'expense' ? 'error.main' : 'text.primary'}
                      >
                        {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                        {formatCurrency(t.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setReceiptTarget(t)}>
                        <AttachFileIcon
                          fontSize="small"
                          color={t.receiptUrl ? 'primary' : 'inherit'}
                        />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(t);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(t)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {rows.map((t) => (
              <Card key={t._id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Chip size="small" label={t.type} color={TYPE_COLOR[t.type]} variant="outlined" sx={{ mb: 0.5 }} />
                      <Typography fontWeight={600}>{describeTransaction(t)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(t.date)}
                      </Typography>
                    </Box>
                    <Typography
                      fontWeight={700}
                      color={t.type === 'income' ? 'success.main' : t.type === 'expense' ? 'error.main' : 'text.primary'}
                    >
                      {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}
                      {formatCurrency(t.amount)}
                    </Typography>
                  </Stack>
                  {t.note && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {t.note}
                    </Typography>
                  )}
                  <Stack direction="row" justifyContent="flex-end" mt={1}>
                    <IconButton size="small" onClick={() => setReceiptTarget(t)}>
                      <AttachFileIcon fontSize="small" color={t.receiptUrl ? 'primary' : 'inherit'} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditing(t);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(t)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <TablePagination
            component="div"
            count={meta.totalItems}
            page={(meta.currentPage || 1) - 1}
            rowsPerPage={meta.pageSize || 10}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={(e, newPage) => setFilters((f) => ({ ...f, page: newPage + 1 }))}
            onRowsPerPageChange={(e) =>
              setFilters((f) => ({ ...f, limit: parseInt(e.target.value, 10), page: 1 }))
            }
          />
        </>
      )}

      <TransactionFormDialog
        open={dialogOpen}
        initialValues={editing}
        categories={categories}
        bankAccounts={bankAccounts}
        upiAccounts={upiAccounts}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this transaction?"
        description="This will reverse its effect on the related account balance."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ReceiptDialog
        open={Boolean(receiptTarget)}
        transaction={receiptTarget}
        onClose={() => setReceiptTarget(null)}
        onUpdated={handleReceiptUpdated}
      />
    </Box>
  );
};

export default Transactions;
