import { useEffect, useState, useCallback } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDownOutlined';
import SavingsIcon from '@mui/icons-material/SavingsOutlined';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { listBankAccounts } from '../../api/bankAccountApi';
import { getCashBalance } from '../../api/cashApi';

// Income/Expense/Saving stats stay at ₹0 until Phase 3 (Transactions) and Phase 5
// (Analytics endpoints) land — Cash in Hand is real as of Phase 2.
const Dashboard = () => {
  const { user } = useAuth();
  const [cashInHand, setCashInHand] = useState(null);

  const load = useCallback(async () => {
    const [bankRes, cashRes] = await Promise.all([listBankAccounts(), getCashBalance()]);
    const bankTotal = bankRes.data.data.items.reduce((sum, b) => sum + b.currentBalance, 0);
    setCashInHand(bankTotal + cashRes.data.data.currentBalance);
  }, []);

  useEffect(() => {
    load().catch(() => setCashInHand(0));
  }, [load]);

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
          <StatCard
            icon={AccountBalanceWalletIcon}
            label="Cash in Hand"
            value={cashInHand === null ? '—' : formatCurrency(cashInHand)}
            subtext="Bank balances + cash ledger"
            color="#146C43"
          />
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
          Income/expense/saving figures and charts go live in Phase 5, once Transactions
          (Phase 3) give them real data to work with.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
