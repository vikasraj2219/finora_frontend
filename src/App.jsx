import { Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Accounts from './pages/accounts/Accounts';
import Categories from './pages/categories/Categories';
import Types from './pages/types/Types';
import Subcategories from './pages/subcategories/Subcategories';
import Transactions from './pages/transactions/Transactions';
import Allocation from './pages/allocation/Allocation';
import Merchants from './pages/merchants/Merchants';
import StatementImport from './pages/imports/StatementImport';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

const App = () => (
  <ThemeModeProvider>
    <SnackbarProvider maxSnack={3} autoHideDuration={3500}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/types" element={<Types />} />
              <Route path="/subcategories" element={<Subcategories />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/allocation" element={<Allocation />} />
              <Route path="/merchants" element={<Merchants />} />
              <Route path="/imports" element={<StatementImport />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </SnackbarProvider>
  </ThemeModeProvider>
);

export default App;
