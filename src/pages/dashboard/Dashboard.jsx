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
import { listTransactions } from '../../api/transactionApi';

const startOfMonthISO = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

// Full chart-based analytics (trends, category/merchant breakdowns, bank/UPI usage)
// arrive in Phase 5 with dedicated /dashboard/* aggregation endpoints. For now these
// four stats are computed client-side from real Phase 2/3 data.
const Dashboard = () => {
  const { user } = useAuth();
  const [cashInHand, setCashInHand] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [monthlyExpense, setMonthlyExpense] = useState(null);

  const load = useCallback(async () => {
    const [bankRes, cashRes, incomeRes, expenseRes] = await Promise.all([
      listBankAccounts(),
      getCashBalance(),
      listTransactions({ type: 'income', dateFrom: startOfMonthISO(), limit: 100 }),
      listTransactions({ type: 'expense', dateFrom: startOfMonthISO(), limit: 100 }),
    ]);
    const bankTotal = bankRes.data.data.items.reduce((sum, b) => sum + b.currentBalance, 0);
    setCashInHand(bankTotal + cashRes.data.data.currentBalance);
    setMonthlyIncome(incomeRes.data.data.items.reduce((sum, t) => sum + t.amount, 0));
    setMonthlyExpense(expenseRes.data.data.items.reduce((sum, t) => sum + t.amount, 0));
  }, []);

  useEffect(() => {
    load().catch(() => {
      setCashInHand(0);
      setMonthlyIncome(0);
      setMonthlyExpense(0);
    });
  }, [load]);

  const saving = monthlyIncome !== null && monthlyExpense !== null ? monthlyIncome - monthlyExpense : null;

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
          <StatCard
            icon={TrendingUpIcon}
            label="Monthly Income"
            value={monthlyIncome === null ? '—' : formatCurrency(monthlyIncome)}
            color="#22C55E"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={TrendingDownIcon}
            label="Monthly Expense"
            value={monthlyExpense === null ? '—' : formatCurrency(monthlyExpense)}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={SavingsIcon}
            label="Monthly Saving"
            value={saving === null ? '—' : formatCurrency(saving)}
            color="#C9A227"
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="body2" color="text.secondary">
          Trend charts, category breakdowns, and bank/UPI usage analytics arrive in Phase 5.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
