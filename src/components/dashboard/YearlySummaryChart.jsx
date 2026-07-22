import { Bar } from 'react-chartjs-2';
import { Card, CardContent, Typography, TextField, MenuItem, Stack } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const YearlySummaryChart = ({ data, year, onYearChange, years }) => {
  const chartData = {
    labels: data.months.map((m) => m.label),
    datasets: [
      { label: 'Income', data: data.months.map((m) => m.income), backgroundColor: '#22C55E', borderRadius: 4 },
      { label: 'Expense', data: data.months.map((m) => m.expense), backgroundColor: '#EF4444', borderRadius: 4 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } },
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v) } } },
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            Yearly Financial Summary
          </Typography>
          <TextField
            size="small"
            select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            sx={{ width: 110 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <div style={{ height: 320 }}>
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default YearlySummaryChart;
