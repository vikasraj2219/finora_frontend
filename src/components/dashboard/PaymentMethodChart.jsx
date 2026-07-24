import { Pie } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { brand } from '../../theme/palette';

const COLORS = [brand.navy, brand.teal, '#3B82F6', '#F59E0B', '#EC4899', brand.navyLight];

const PaymentMethodChart = ({ distribution }) => {
  const data = {
    labels: distribution.map((d) => d.method.charAt(0).toUpperCase() + d.method.slice(1)),
    datasets: [
      {
        data: distribution.map((d) => d.total),
        backgroundColor: distribution.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}` } },
    },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Payment Method Distribution
        </Typography>
        {distribution.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No transactions yet.
          </Typography>
        ) : (
          <Box sx={{ height: 260 }}>
            <Pie data={data} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodChart;
