import '../../utils/chartSetup';
import { useEffect, useState, useCallback } from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDownOutlined';
import SavingsIcon from '@mui/icons-material/SavingsOutlined';

import StatCard from '../../components/common/StatCard';
import IncomeExpenseTrendChart from '../../components/dashboard/IncomeExpenseTrendChart';
import CashFlowChart from '../../components/dashboard/CashFlowChart';
import CategoryBreakdownChart from '../../components/dashboard/CategoryBreakdownChart';
import PaymentMethodChart from '../../components/dashboard/PaymentMethodChart';
import AccountUsageCard from '../../components/dashboard/AccountUsageCard';
import YearlySummaryChart from '../../components/dashboard/YearlySummaryChart';
import { brand } from '../../theme/palette';
import HighlightsCard from '../../components/dashboard/HighlightsCard';

import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  getDashboardSummary,
  getDashboardTrends,
  getCategoryBreakdown,
  getPaymentMethodDistribution,
  getAccountUsage,
  getYearlySummary,
} from '../../api/dashboardApi';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear, currentYear - 1, currentYear - 2];

// Everything on this page is now backed by the real /dashboard/* aggregation endpoints.
const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categoryType, setCategoryType] = useState('expense');
  const [breakdown, setBreakdown] = useState([]);
  const [paymentDist, setPaymentDist] = useState([]);
  const [usage, setUsage] = useState({ banks: [], upi: [] });
  const [year, setYear] = useState(currentYear);
  const [yearlyData, setYearlyData] = useState({ year: currentYear, months: [] });

  const loadCore = useCallback(async () => {
    const [summaryRes, trendsRes, distRes, usageRes] = await Promise.all([
      getDashboardSummary(),
      getDashboardTrends(6),
      getPaymentMethodDistribution(),
      getAccountUsage(),
    ]);
    setSummary(summaryRes.data.data);
    setTrends(trendsRes.data.data);
    setPaymentDist(distRes.data.data);
    setUsage(usageRes.data.data);
  }, []);

  const loadBreakdown = useCallback(async () => {
    const { data } = await getCategoryBreakdown({ type: categoryType });
    setBreakdown(data.data);
  }, [categoryType]);

  const loadYearly = useCallback(async () => {
    const { data } = await getYearlySummary(year);
    setYearlyData(data.data);
  }, [year]);

  useEffect(() => {
    loadCore()
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadBreakdown().catch(() => {});
  }, [loadBreakdown]);

  useEffect(() => {
    loadYearly().catch(() => {});
  }, [loadYearly]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        Welcome, {user?.name?.split(' ')[0]}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Here's a snapshot of your finances
      </Typography>

      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={AccountBalanceWalletIcon}
            label="Cash in Hand"
            value={formatCurrency(summary.cashInHand)}
            subtext="Bank balances + cash ledger"
            color={brand.navy}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={TrendingUpIcon}
            label="Monthly Income"
            value={formatCurrency(summary.monthlyIncome)}
            color="#22C55E"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={TrendingDownIcon}
            label="Monthly Expense"
            value={formatCurrency(summary.monthlyExpense)}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={SavingsIcon}
            label="Monthly Saving"
            value={formatCurrency(summary.monthlySaving)}
            color={brand.teal}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total Income (all-time)" value={formatCurrency(summary.totalIncome)} color="#22C55E" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total Expense (all-time)" value={formatCurrency(summary.totalExpense)} color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Net Savings (all-time)" value={formatCurrency(summary.netSavings)} color="#3B82F6" />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={0.5}>
        <Grid item xs={12} lg={8}>
          <IncomeExpenseTrendChart trends={trends} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <HighlightsCard summary={summary} />
        </Grid>

        <Grid item xs={12} lg={6}>
          <CashFlowChart trends={trends} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <CategoryBreakdownChart breakdown={breakdown} type={categoryType} onTypeChange={setCategoryType} />
        </Grid>

        <Grid item xs={12} lg={6}>
          <PaymentMethodChart distribution={paymentDist} />
        </Grid>
        <Grid item xs={12} lg={3}>
          <AccountUsageCard title="Bank-wise Usage" items={usage.banks} />
        </Grid>
        <Grid item xs={12} lg={3}>
          <AccountUsageCard title="UPI-wise Usage" items={usage.upi} />
        </Grid>

        <Grid item xs={12}>
          <YearlySummaryChart data={yearlyData} year={year} onYearChange={setYear} years={YEAR_OPTIONS} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
