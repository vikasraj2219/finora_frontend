import { Card, CardContent, Typography, Stack, Box, Divider } from '@mui/material';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Row = ({ label, value, sub }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" py={1}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box textAlign="right">
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Box>
  </Stack>
);

// Compact "at a glance" facts that don't need their own chart — today's spending,
// expense ratio, most-used accounts, and the largest single transactions of each type.
const HighlightsCard = ({ summary }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
        Highlights
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Row label="Today's Spending" value={formatCurrency(summary.todaySpending)} />
      <Row
        label="Expense Ratio"
        value={summary.expenseRatio === null ? '—' : `${summary.expenseRatio}%`}
        sub="of this month's income"
      />
      <Row
        label="Most Used Bank"
        value={summary.mostUsedBank?.name || '—'}
        sub={summary.mostUsedBank ? `${summary.mostUsedBank.transactionCount} transactions` : undefined}
      />
      <Row
        label="Most Used UPI"
        value={summary.mostUsedUpi?.name || '—'}
        sub={summary.mostUsedUpi ? `${summary.mostUsedUpi.transactionCount} transactions` : undefined}
      />
      <Row
        label="Top Spending Category"
        value={summary.highestSpendingCategory?.name || '—'}
        sub={summary.highestSpendingCategory ? formatCurrency(summary.highestSpendingCategory.total) : undefined}
      />
      <Row
        label="Largest Expense"
        value={summary.largestExpense ? formatCurrency(summary.largestExpense.amount) : '—'}
        sub={summary.largestExpense ? `${summary.largestExpense.category || 'Uncategorized'} · ${formatDate(summary.largestExpense.date)}` : undefined}
      />
      <Row
        label="Largest Income"
        value={summary.largestIncome ? formatCurrency(summary.largestIncome.amount) : '—'}
        sub={summary.largestIncome ? `${summary.largestIncome.category || 'Uncategorized'} · ${formatDate(summary.largestIncome.date)}` : undefined}
      />
    </CardContent>
  </Card>
);

export default HighlightsCard;
