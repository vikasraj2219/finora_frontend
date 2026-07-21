import { Grid, Typography, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDownOutlined';
import SavingsIcon from '@mui/icons-material/SavingsOutlined';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';

// Phase 1 placeholder — wired to real /dashboard/* endpoints starting Phase 5.
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        Welcome, {user?.name?.split(' ')[0]}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Here's a snapshot of your finances
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={AccountBalanceWalletIcon} label="Cash in Hand" value="₹0" color="#146C43" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={TrendingUpIcon} label="Monthly Income" value="₹0" color="#22C55E" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={TrendingDownIcon} label="Monthly Expense" value="₹0" color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={SavingsIcon} label="Monthly Saving" value="₹0" color="#C9A227" />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="body2" color="text.secondary">
          Charts and detailed analytics (income vs expense, category breakdown, bank/UPI usage) arrive in
          Phase 5 once transactions and accounts are wired in Phases 2–3.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
