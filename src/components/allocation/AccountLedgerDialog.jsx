import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  TablePagination,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getAccountLedger, getAccountStats } from '../../api/transactionApi';

const TABS = [
  { value: '', label: 'All' },
  { value: 'UNALLOCATED', label: '🔴 Unallocated' },
  { value: 'PARTIALLY_ALLOCATED', label: '🟡 Partial' },
  { value: 'FULLY_ALLOCATED', label: '🟢 Complete' },
];

const describeRoute = (t) => {
  if (t.type === 'transfer') {
    const from = t.transferFrom?.type === 'cash' ? 'Cash' : t.transferFrom?.bankAccount?.bankName || '—';
    const to = t.transferTo?.type === 'cash' ? 'Cash' : t.transferTo?.bankAccount?.bankName || '—';
    return `${from} → ${to}`;
  }
  if (!t.category) return t.note || '—';
  return t.subcategory ? `${t.category.name} › ${t.subcategory.name}` : t.category.name;
};

// Spec sections 11–13: the drill-down ledger + stats for one bank or UPI account.
const AccountLedgerDialog = ({ open, onClose, account, accountType }) => {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, pageSize: 20 });
  const [tab, setTab] = useState('');
  const [page, setPage] = useState(1);

  const accountRef = accountType === 'bank' ? { bankAccount: account?._id } : { upiAccount: account?._id };

  const load = useCallback(async () => {
    if (!account) return;
    const params = { ...accountRef, page, limit: 20 };
    if (tab) params.allocationStatus = tab;
    const [statsRes, ledgerRes] = await Promise.all([
      getAccountStats(accountRef),
      getAccountLedger(params),
    ]);
    setStats(statsRes.data.data);
    setRows(ledgerRes.data.data.items);
    setMeta(ledgerRes.data.data.meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?._id, tab, page]);

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, page]);

  useEffect(() => {
    if (open) {
      setTab('');
      setPage(1);
    }
  }, [open, account?._id]);

  if (!account) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{account.bankName || account.nickname || account.provider}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {stats && (
          <Grid container spacing={1.5} mb={2}>
            {[
              { label: 'Total Transactions', value: stats.totalTransactions },
              { label: 'Total Income', value: formatCurrency(stats.totalIncome) },
              { label: 'Total Expenses', value: formatCurrency(stats.totalExpense) },
              { label: 'Total Transfers', value: stats.totalTransfers },
              { label: '🔴 Unallocated', value: stats.unallocated },
              { label: '🟡 Partially Allocated', value: stats.partiallyAllocated },
              { label: '🟢 Fully Allocated', value: stats.fullyAllocated },
            ].map((s) => (
              <Grid item xs={6} sm={4} md={3} key={s.label}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary">
                      {s.label}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {s.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Tabs
          value={tab}
          onChange={(e, v) => {
            setTab(v);
            setPage(1);
          }}
          sx={{ mb: 1.5 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>

        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" py={3} textAlign="center">
            No transactions here yet.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category / Route</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((t) => (
                    <TableRow key={t._id} hover>
                      <TableCell>{formatDate(t.date)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={t.type} variant="outlined" />
                      </TableCell>
                      <TableCell>{describeRoute(t)}</TableCell>
                      <TableCell>
                        {t.allocationStatus === 'UNALLOCATED' && <Chip size="small" label="🔴" variant="outlined" />}
                        {t.allocationStatus === 'PARTIALLY_ALLOCATED' && <Chip size="small" label="🟡" variant="outlined" />}
                        {t.allocationStatus === 'FULLY_ALLOCATED' && <Chip size="small" label="🟢" variant="outlined" />}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={meta.totalItems}
              page={(meta.currentPage || 1) - 1}
              rowsPerPage={meta.pageSize || 20}
              rowsPerPageOptions={[20]}
              onPageChange={(e, newPage) => setPage(newPage + 1)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccountLedgerDialog;
