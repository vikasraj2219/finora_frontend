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
import Transactions from './pages/transactions/Transactions';
import Merchants from './pages/merchants/Merchants';
import StatementImport from './pages/imports/StatementImport';

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
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/merchants" element={<Merchants />} />
              <Route path="/imports" element={<StatementImport />} />
              {/* /reports, /settings are added as each phase is delivered. */}
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
