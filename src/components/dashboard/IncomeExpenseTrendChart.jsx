import { Bar } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const IncomeExpenseTrendChart = ({ trends }) => {
  const data = {
    labels: trends.map((t) => t.label),
    datasets: [
      { label: 'Income', data: trends.map((t) => t.income), backgroundColor: '#22C55E', borderRadius: 6 },
      { label: 'Expense', data: trends.map((t) => t.expense), backgroundColor: '#EF4444', borderRadius: 6 },
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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Income vs Expense
        </Typography>
        <div style={{ height: 280 }}>
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseTrendChart;
