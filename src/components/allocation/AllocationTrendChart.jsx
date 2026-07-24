import '../../utils/chartSetup';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box } from '@mui/material';

// Stacked monthly bar chart of allocation status — spec section 19 "Allocation Trend
// Over Time" / "Allocation Status by Month".
const AllocationTrendChart = ({ trend }) => {
  const data = {
    labels: trend.map((t) => t.month),
    datasets: [
      { label: 'Unallocated', data: trend.map((t) => t.UNALLOCATED), backgroundColor: '#EF4444' },
      { label: 'Partially Allocated', data: trend.map((t) => t.PARTIALLY_ALLOCATED), backgroundColor: '#F59E0B' },
      { label: 'Fully Allocated', data: trend.map((t) => t.FULLY_ALLOCATED), backgroundColor: '#22C55E' },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
    },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Allocation Trend
        </Typography>
        {trend.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No transactions in this period yet.
          </Typography>
        ) : (
          <Box sx={{ height: 260 }}>
            <Bar data={data} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AllocationTrendChart;
