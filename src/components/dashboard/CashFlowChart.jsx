import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/palette';

const CashFlowChart = ({ trends }) => {
  const data = {
    labels: trends.map((t) => t.label),
    datasets: [
      {
        label: 'Net Cash Flow',
        data: trends.map((t) => t.netFlow),
        borderColor: brand.teal,
        backgroundColor: 'rgba(18, 165, 157, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `Net: ${formatCurrency(ctx.raw)}` } },
    },
    scales: { y: { ticks: { callback: (v) => formatCurrency(v) } } },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Monthly Cash Flow
        </Typography>
        <div style={{ height: 280 }}>
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
