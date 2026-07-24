import { Box, TextField, MenuItem, Stack, Button } from '@mui/material';

const TransactionFilters = ({ filters, onChange, categories, onClear }) => {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value, page: 1 });

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2} flexWrap="wrap" useFlexGap>
      <TextField
        size="small"
        placeholder="Search notes…"
        value={filters.search || ''}
        onChange={set('search')}
        sx={{ minWidth: 200 }}
      />
      <TextField size="small" select label="Type" value={filters.type || ''} onChange={set('type')} sx={{ minWidth: 140 }}>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="income">Income</MenuItem>
        <MenuItem value="expense">Expense</MenuItem>
        <MenuItem value="transfer">Transfer</MenuItem>
        <MenuItem value="adjustment">Adjustment</MenuItem>
        <MenuItem value="opening_balance">Opening Balance</MenuItem>
      </TextField>
      <TextField
        size="small"
        select
        label="Category"
        value={filters.category || ''}
        onChange={set('category')}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c._id} value={c._id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        select
        label="Status"
        value={filters.allocationStatus || ''}
        onChange={set('allocationStatus')}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="UNALLOCATED">🔴 Unallocated</MenuItem>
        <MenuItem value="PARTIALLY_ALLOCATED">🟡 Partially Allocated</MenuItem>
        <MenuItem value="FULLY_ALLOCATED">🟢 Fully Allocated</MenuItem>
      </TextField>
      <TextField
        size="small"
        select
        label="Source"
        value={filters.entrySource || ''}
        onChange={set('entrySource')}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="MANUAL">Manual</MenuItem>
        <MenuItem value="IMPORTED">Imported</MenuItem>
      </TextField>
      <TextField
        size="small"
        type="date"
        label="From"
        InputLabelProps={{ shrink: true }}
        value={filters.dateFrom || ''}
        onChange={set('dateFrom')}
        sx={{ minWidth: 150 }}
      />
      <TextField
        size="small"
        type="date"
        label="To"
        InputLabelProps={{ shrink: true }}
        value={filters.dateTo || ''}
        onChange={set('dateTo')}
        sx={{ minWidth: 150 }}
      />
      <Button onClick={onClear} size="small">
        Clear
      </Button>
    </Stack>
  );
};

export default TransactionFilters;
