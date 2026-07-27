import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Checkbox,
  Chip,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  LinearProgress,
  Card,
  CardContent,
  TablePagination,
  Grid,
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/ChecklistOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TransactionFormDialog from '../../components/transactions/TransactionFormDialog';
import AllocationTrendChart from '../../components/allocation/AllocationTrendChart';
import EntrySourceChart from '../../components/allocation/EntrySourceChart';
import { formatCurrency, formatDate } from '../../utils/formatters';

import {
  listTransactions,
  updateTransaction,
  bulkAllocateTransactions,
  bulkDeleteTransactions,
  getAllocationSummary,
  getAllocationTrend,
  getEntrySourceSummary,
} from '../../api/transactionApi';
import { listCategories } from '../../api/categoryApi';
import { listSubcategories } from '../../api/subcategoryApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listUpiAccounts } from '../../api/upiAccountApi';

const TABS = [
  { value: '', label: 'All' },
  { value: 'UNALLOCATED', label: '🔴 Unallocated' },
  { value: 'PARTIALLY_ALLOCATED', label: '🟡 Partially Allocated' },
  { value: 'FULLY_ALLOCATED', label: '🟢 Fully Allocated' },
];

const CLASSIFIABLE_TYPES = ['income', 'expense'];

const describeRoute = (t) => {
  if (t.type !== 'transfer') return null;
  const from = t.transferFrom?.type === 'cash' ? 'Cash' : t.transferFrom?.bankAccount?.bankName || '—';
  const to = t.transferTo?.type === 'cash' ? 'Cash' : t.transferTo?.bankAccount?.bankName || '—';
  return `${from} → ${to}`;
};

// Dedicated allocation workspace: browse by allocation status, select many transactions
// at once, and apply one Type→Category→Subcategory assignment to all of them in a
// single call (spec sections 16–20), or bulk-delete a selection outright. Editing a
// single transaction reuses the normal TransactionFormDialog rather than a separate
// screen.
const Allocation = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [tab, setTab] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, pageSize: 20 });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [entrySource, setEntrySource] = useState(null);
  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiAccounts, setUpiAccounts] = useState([]);

  const [bulkType, setBulkType] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [bulkSubcategories, setBulkSubcategories] = useState([]);
  const [applying, setApplying] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const loadLookups = useCallback(async () => {
    const [catRes, bankRes, upiRes] = await Promise.all([listCategories(), listBankAccounts(), listUpiAccounts()]);
    setCategories(catRes.data.data);
    setBankAccounts(bankRes.data.data.items);
    setUpiAccounts(upiRes.data.data.items);
  }, []);

  const loadSummary = useCallback(async () => {
    const { data } = await getAllocationSummary();
    setSummary(data.data);
  }, []);

  const loadDashboardCharts = useCallback(async () => {
    const [trendRes, sourceRes] = await Promise.all([getAllocationTrend(6), getEntrySourceSummary()]);
    setTrend(trendRes.data.data);
    setEntrySource(sourceRes.data.data);
  }, []);

  const loadRows = useCallback(async () => {
    const params = { page, limit: 20 };
    if (tab) params.allocationStatus = tab;
    const { data } = await listTransactions(params);
    setRows(data.data.items);
    setMeta(data.data.meta);
    setSelected([]);
  }, [tab, page]);

  useEffect(() => {
    loadLookups().catch(() => enqueueSnackbar('Failed to load categories/accounts', { variant: 'error' }));
    loadSummary().catch(() => {});
    loadDashboardCharts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRows().catch(() => enqueueSnackbar('Failed to load transactions', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  // Picking a category implies its type — keep the Type field in sync so the request
  // sent is never contradictory (backend rejects a mismatched pair anyway).
  useEffect(() => {
    setBulkSubcategory('');
    if (!bulkCategory) {
      setBulkSubcategories([]);
      return;
    }
    const cat = categories.find((c) => c._id === bulkCategory);
    if (cat) setBulkType(cat.type);
    listSubcategories({ category: bulkCategory })
      .then(({ data }) => setBulkSubcategories(data.data))
      .catch(() => setBulkSubcategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkCategory]);

  const toggleRow = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    const ids = rows.map((r) => r._id);
    setSelected((prev) => (prev.length === ids.length ? [] : ids));
  };

  const refreshAll = () => {
    loadRows();
    loadSummary();
    loadDashboardCharts();
  };

  const applyBulk = async () => {
    if ((!bulkType && !bulkCategory) || selected.length === 0) return;
    setApplying(true);
    try {
      const { data } = await bulkAllocateTransactions({
        transactionIds: selected,
        type: bulkCategory ? undefined : bulkType || undefined,
        category: bulkCategory || undefined,
        subcategory: bulkSubcategory || undefined,
      });
      const { updated, skippedCount } = data.data;
      enqueueSnackbar(
        `${updated} transaction${updated === 1 ? '' : 's'} allocated${skippedCount ? `, ${skippedCount} skipped` : ''}`,
        { variant: skippedCount ? 'warning' : 'success' }
      );
      setBulkType('');
      setBulkCategory('');
      setBulkSubcategory('');
      refreshAll();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Bulk allocation failed', { variant: 'error' });
    } finally {
      setApplying(false);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const { data } = await bulkDeleteTransactions(selected);
      const { deleted, skippedCount } = data.data;
      enqueueSnackbar(
        `${deleted} transaction${deleted === 1 ? '' : 's'} deleted${skippedCount ? `, ${skippedCount} skipped` : ''}`,
        { variant: skippedCount ? 'warning' : 'success' }
      );
      setBulkDeleteOpen(false);
      refreshAll();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Bulk delete failed', { variant: 'error' });
    }
  };

  const saveEdit = async (payload) => {
    try {
      await updateTransaction(editing._id, payload);
      enqueueSnackbar('Transaction updated', { variant: 'success' });
      setEditing(null);
      refreshAll();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title="Allocation" subtitle="Classify imported and unclassified transactions, one at a time or in bulk" />

      {summary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {summary.fullyAllocatedPct}% of {summary.total} transactions fully allocated
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🔴 {summary.UNALLOCATED} · 🟡 {summary.PARTIALLY_ALLOCATED} · 🟢 {summary.FULLY_ALLOCATED}
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={summary.fullyAllocatedPct} sx={{ height: 8, borderRadius: 4 }} />
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <AllocationTrendChart trend={trend} />
        </Grid>
        <Grid item xs={12} md={4}>
          <EntrySourceChart summary={entrySource} />
        </Grid>
      </Grid>

      <Tabs
        value={tab}
        onChange={(e, v) => {
          setTab(v);
          setPage(1);
        }}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {selected.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'action.hover' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} flexWrap="wrap">
              <Typography variant="body2" fontWeight={600}>
                {selected.length} selected
              </Typography>
              <TextField
                select
                size="small"
                label="Type"
                value={bulkType}
                onChange={(e) => {
                  setBulkType(e.target.value);
                  setBulkCategory('');
                }}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">
                  <em>Not set</em>
                </MenuItem>
                {CLASSIFIABLE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Category"
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">
                  <em>Not set</em>
                </MenuItem>
                {categories
                  .filter((c) => !bulkType || c.type === bulkType)
                  .map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name} ({c.type})
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Subcategory (optional)"
                value={bulkSubcategory}
                onChange={(e) => setBulkSubcategory(e.target.value)}
                sx={{ minWidth: 200 }}
                disabled={!bulkCategory || bulkSubcategories.length === 0}
              >
                <MenuItem value="">
                  <em>{bulkSubcategories.length ? 'None' : 'No subcategories'}</em>
                </MenuItem>
                {bulkSubcategories.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" disabled={(!bulkType && !bulkCategory) || applying} onClick={applyBulk}>
                {applying ? 'Applying…' : 'Apply Allocation'}
              </Button>
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => setBulkDeleteOpen(true)}>
                Delete Selected
              </Button>
              <Button onClick={() => setSelected([])}>Clear selection</Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Picking a category sets its type automatically. Transfers/adjustments/opening balances in the
              selection are skipped — they aren't classifiable.
            </Typography>
          </CardContent>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState icon={ChecklistIcon} title="Nothing here" description="No transactions match this allocation status." />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < rows.length}
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Subcategory</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((t) => (
                  <TableRow
                    key={t._id}
                    hover
                    selected={selected.includes(t._id)}
                    onClick={() => setEditing(t)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(t._id)} onChange={() => toggleRow(t._id)} />
                    </TableCell>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip size="small" label={t.type} variant="outlined" />
                        {!t.typeAllocated && (
                          <Chip size="small" label="?" variant="outlined" sx={{ minWidth: 22 }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{t.type === 'transfer' ? describeRoute(t) : t.category?.name || '—'}</TableCell>
                    <TableCell>{t.subcategory?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.entrySource === 'IMPORTED' ? 'Imported' : 'Manual'} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {t.allocationStatus === 'UNALLOCATED' && <Chip size="small" label="🔴 Unallocated" color="error" variant="outlined" />}
                      {t.allocationStatus === 'PARTIALLY_ALLOCATED' && (
                        <Chip size="small" label="🟡 Partial" color="warning" variant="outlined" />
                      )}
                      {t.allocationStatus === 'FULLY_ALLOCATED' && (
                        <Chip size="small" label="🟢 Complete" color="success" variant="outlined" />
                      )}
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

      <TransactionFormDialog
        open={Boolean(editing)}
        initialValues={editing}
        categories={categories}
        bankAccounts={bankAccounts}
        upiAccounts={upiAccounts}
        onClose={() => setEditing(null)}
        onSubmit={saveEdit}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selected.length} transaction${selected.length === 1 ? '' : 's'}?`}
        description="This will reverse each one's effect on its related account balance. This can't be undone."
        confirmLabel="Delete All"
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
      />
    </Box>
  );
};

export default Allocation;
