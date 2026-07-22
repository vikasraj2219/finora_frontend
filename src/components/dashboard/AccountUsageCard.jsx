import { Card, CardContent, Typography, Box, LinearProgress, Stack } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const UsageBar = ({ label, count, total, max }) => (
  <Box mb={2}>
    <Stack direction="row" justifyContent="space-between" mb={0.5}>
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {count} txns · {formatCurrency(total)}
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={max > 0 ? (total / max) * 100 : 0}
      sx={{ height: 8, borderRadius: 4 }}
    />
  </Box>
);

// Shared by both Bank-wise and UPI-wise usage — `items` is whichever list is passed in.
const AccountUsageCard = ({ title, items }) => {
  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          {title}
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No usage data yet.
          </Typography>
        ) : (
          items.map((item) => (
            <UsageBar key={item.id} label={item.name} count={item.count} total={item.total} max={max} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AccountUsageCard;
