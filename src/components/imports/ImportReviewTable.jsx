import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Checkbox,
  TextField,
  MenuItem,
  Chip,
  Typography,
} from '@mui/material';
import { formatCurrency, formatDate } from '../../utils/formatters';

// One row per parsed statement line — category/merchant are editable before confirming,
// and likely-duplicate rows are pre-unchecked with a warning chip.
const ImportReviewTable = ({ rows, categories, onRowChange }) => (
  <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
    <Table size="small" sx={{ minWidth: 760 }}>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" />
          <TableCell>Date</TableCell>
          <TableCell>Description</TableCell>
          <TableCell align="right">Amount</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Merchant</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => {
          const relevantCategories = categories.filter((c) => c.type === row.type);
          return (
            <TableRow key={idx} hover selected={row.isDuplicate}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={row.include}
                  onChange={(e) => onRowChange(idx, { include: e.target.checked })}
                />
              </TableCell>
              <TableCell>{formatDate(row.date)}</TableCell>
              <TableCell sx={{ maxWidth: 220 }}>
                <Typography variant="body2" noWrap>
                  {row.description}
                </Typography>
                {row.isDuplicate && <Chip size="small" color="warning" label="Possible duplicate" sx={{ mt: 0.5 }} />}
              </TableCell>
              <TableCell align="right">
                <Typography color={row.type === 'income' ? 'success.main' : 'error.main'} fontWeight={600}>
                  {row.type === 'income' ? '+' : '-'}
                  {formatCurrency(row.amount)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip size="small" label={row.type} variant="outlined" />
              </TableCell>
              <TableCell sx={{ minWidth: 160 }}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  value={row.category || ''}
                  onChange={(e) => onRowChange(idx, { category: e.target.value })}
                >
                  <MenuItem value="">Select…</MenuItem>
                  {relevantCategories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell sx={{ minWidth: 160 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={row.suggestedMerchant?.name || 'New merchant name'}
                  value={row.newMerchantName || ''}
                  onChange={(e) => onRowChange(idx, { newMerchantName: e.target.value })}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ImportReviewTable;
