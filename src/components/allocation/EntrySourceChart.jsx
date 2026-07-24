import '../../utils/chartSetup';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box } from '@mui/material';

// Spec section 19 "Imported vs Manual Transactions".
const EntrySourceChart = ({ summary }) => {
  const total = (summary?.IMPORTED || 0) + (summary?.MANUAL || 0);

  const data = {
    labels: ['Imported', 'Manual'],
    datasets: [
      {
        data: [summary?.IMPORTED || 0, summary?.MANUAL || 0],
        backgroundColor: ['#3B82F6', '#94A3B8'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
    },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Imported vs Manual
        </Typography>
        {total === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No transactions yet.
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

export default EntrySourceChart;
