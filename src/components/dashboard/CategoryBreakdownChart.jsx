import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, Typography, ToggleButtonGroup, ToggleButton, Stack, Box } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const CategoryBreakdownChart = ({ breakdown, type, onTypeChange }) => {
  const data = {
    labels: breakdown.map((b) => b.name),
    datasets: [
      {
        data: breakdown.map((b) => b.total),
        backgroundColor: breakdown.map((b) => b.color),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            Category Breakdown
          </Typography>
          <ToggleButtonGroup size="small" value={type} exclusive onChange={(e, v) => v && onTypeChange(v)}>
            <ToggleButton value="expense">Expense</ToggleButton>
            <ToggleButton value="income">Income</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {breakdown.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No {type} transactions with a category yet.
          </Typography>
        ) : (
          <Box sx={{ height: 260 }}>
            <Doughnut data={data} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownChart;
