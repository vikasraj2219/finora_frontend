import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import ImportReviewTable from '../../components/imports/ImportReviewTable';
import { previewImport, confirmImport } from '../../api/importApi';
import { listBankAccounts } from '../../api/bankAccountApi';
import { listCategories } from '../../api/categoryApi';

const STEPS = ['Upload Statement', 'Review & Categorize', 'Done'];

const StatementImport = () => {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [importBatchId, setImportBatchId] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const loadLookups = useCallback(async () => {
    const [bankRes, catRes] = await Promise.all([listBankAccounts(), listCategories()]);
    setBankAccounts(bankRes.data.data.items);
    setCategories(catRes.data.data);
  }, []);

  useEffect(() => {
    loadLookups().catch(() => enqueueSnackbar('Failed to load accounts/categories', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    if (!selectedBank || !file) {
      enqueueSnackbar('Choose a bank account and a file first', { variant: 'warning' });
      return;
    }
    setUploading(true);
    try {
      const { data } = await previewImport(file, selectedBank);
      setImportBatchId(data.data.importBatchId);
      setRows(
        data.data.rows.map((r) => ({
          ...r,
          include: !r.isDuplicate,
          category: r.suggestedCategory?._id || r.suggestedCategory || '',
          merchant: r.suggestedMerchant?.id || '',
          newMerchantName: '',
        }))
      );
      setActiveStep(1);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not parse this file', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const updateRow = (idx, changes) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)));
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const { data } = await confirmImport({
        bankAccount: selectedBank,
        importBatchId,
        rows: rows.map((r) => ({
          include: r.include,
          date: r.date,
          type: r.type,
          amount: r.amount,
          description: r.description,
          category: r.category || undefined,
          merchant: r.merchant || undefined,
          newMerchantName: r.merchant ? undefined : r.newMerchantName || undefined,
        })),
      });
      setSummary(data.data);
      setActiveStep(2);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Import failed', { variant: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  const startOver = () => {
    setActiveStep(0);
    setFile(null);
    setRows([]);
    setImportBatchId(null);
    setSummary(null);
  };

  const selectedCount = rows.filter((r) => r.include).length;

  return (
    <Box>
      <PageHeader title="Import Statement" subtitle="Bring in transactions from a CSV, Excel, or PDF bank statement" />

      <Stepper activeStep={activeStep} sx={{ mb: 3, maxWidth: 560 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Card sx={{ maxWidth: 480 }}>
          <CardContent>
            <Stack spacing={2.5}>
              <TextField
                select
                label="Bank Account"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                fullWidth
              >
                {bankAccounts.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.bankName} {b.accountNickname ? `— ${b.accountNickname}` : ''}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                {file ? file.name : 'Choose CSV, XLSX, or PDF file'}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Button>

              <Alert severity="info" variant="outlined">
                CSV or Excel exports parse most reliably. PDF statements work best when they're simple
                tabular layouts — complex multi-column PDFs may need manual entry instead.
              </Alert>

              <Button variant="contained" size="large" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Parsing…' : 'Upload & Preview'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {rows.length} transactions found · {selectedCount} selected for import. Possible duplicates are
            unchecked by default — review before including them.
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
            <TextField
              select
              size="small"
              label="Set category for all selected"
              value=""
              sx={{ minWidth: 220 }}
              onChange={(e) => {
                const value = e.target.value;
                setRows((prev) => prev.map((r) => (r.include ? { ...r, category: value } : r)));
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name} ({c.type})
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="caption" color="text.secondary">
              Rows left without a category are still imported — they'll show up as
              "Unallocated" or "Partially Allocated" so you can classify them anytime.
            </Typography>
          </Stack>

          <ImportReviewTable rows={rows} categories={categories} onRowChange={updateRow} />

          <Stack direction="row" spacing={2} mt={3}>
            <Button onClick={startOver}>Start Over</Button>
            <Button variant="contained" onClick={handleConfirm} disabled={confirming || selectedCount === 0}>
              {confirming ? 'Importing…' : `Import ${selectedCount} Transaction${selectedCount === 1 ? '' : 's'}`}
            </Button>
          </Stack>
        </Box>
      )}

      {activeStep === 2 && summary && (
        <Card sx={{ maxWidth: 480 }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1.5 }} />
            <Typography variant="h6" mb={0.5}>
              Import Complete
            </Typography>
            <Typography color="text.secondary" mb={3}>
              {summary.created} transaction{summary.created === 1 ? '' : 's'} added
              {summary.unallocated > 0 ? ` (${summary.unallocated} need${summary.unallocated === 1 ? 's' : ''} allocation — see Unallocated Transactions)` : ''}
              {summary.skipped > 0 ? `, ${summary.skipped} unchecked row${summary.skipped === 1 ? '' : 's'} not imported` : ''}.
            </Typography>
            <Button variant="contained" onClick={startOver}>
              Import Another Statement
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StatementImport;
