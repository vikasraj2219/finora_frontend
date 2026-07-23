import { useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, TextField, MenuItem } from '@mui/material';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import { exportTransactions, exportSummary } from '../../api/reportApi';
import { downloadBlob } from '../../utils/downloadBlob';

const Reports = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', type: '' });
  const [loadingFormat, setLoadingFormat] = useState(null);

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const handleExportTransactions = async (format) => {
    setLoadingFormat(format);
    try {
      const params = {};
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.type) params.type = filters.type;
      const { data } = await exportTransactions(format, params);
      downloadBlob(data, `transactions.${format}`);
    } catch (err) {
      enqueueSnackbar('Export failed', { variant: 'error' });
    } finally {
      setLoadingFormat(null);
    }
  };

  const handleExportSummary = async () => {
    setLoadingFormat('summary');
    try {
      const { data } = await exportSummary();
      downloadBlob(data, 'financial-summary.pdf');
    } catch (err) {
      enqueueSnackbar('Export failed', { variant: 'error' });
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Export your transactions or a financial summary" />

      <Card sx={{ maxWidth: 560, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Transaction Export
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <TextField
              size="small"
              type="date"
              label="From"
              InputLabelProps={{ shrink: true }}
              value={filters.dateFrom}
              onChange={set('dateFrom')}
              fullWidth
            />
            <TextField
              size="small"
              type="date"
              label="To"
              InputLabelProps={{ shrink: true }}
              value={filters.dateTo}
              onChange={set('dateTo')}
              fullWidth
            />
            <TextField size="small" select label="Type" value={filters.type} onChange={set('type')} fullWidth>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
          </Stack>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportTransactions('csv')}
              disabled={loadingFormat === 'csv'}
            >
              CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportTransactions('xlsx')}
              disabled={loadingFormat === 'xlsx'}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportTransactions('pdf')}
              disabled={loadingFormat === 'pdf'}
            >
              PDF
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Financial Summary
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            A one-page PDF snapshot of your totals, this month's figures, and key highlights.
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportSummary}
            disabled={loadingFormat === 'summary'}
          >
            Download Summary PDF
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
