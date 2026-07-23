import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { updateProfileRequest, updatePasswordRequest } from '../../api/authApi';
import { listAuditLogs } from '../../api/auditLogApi';
import { formatDate } from '../../utils/formatters';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const ProfileTab = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { name: user?.name || '', currency: user?.currency || 'INR' } });

  const submit = async (values) => {
    try {
      await updateProfileRequest(values);
      enqueueSnackbar('Profile updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    }
  };

  return (
    <Card sx={{ maxWidth: 480 }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(submit)}>
          <Stack spacing={2}>
            <TextField label="Full Name" {...register('name', { required: true })} fullWidth />
            <TextField label="Email" value={user?.email || ''} disabled fullWidth />
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Currency" fullWidth>
                  {CURRENCIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

const SecurityTab = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const submit = async (values) => {
    try {
      await updatePasswordRequest(values);
      enqueueSnackbar('Password updated', { variant: 'success' });
      reset();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    }
  };

  return (
    <Card sx={{ maxWidth: 480 }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(submit)}>
          <Stack spacing={2}>
            <TextField
              label="Current Password"
              type="password"
              {...register('currentPassword', { required: 'Required' })}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              {...register('newPassword', {
                required: 'Required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

const ACTION_COLOR = { created: 'success', updated: 'info', deleted: 'error' };

const ActivityLogTab = () => {
  const [logs, setLogs] = useState([]);

  const load = useCallback(async () => {
    const { data } = await listAuditLogs({ limit: 50 });
    setLogs(data.data.items);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Recent Activity
        </Typography>
        {logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No activity recorded yet.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>When</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l._id}>
                    <TableCell>{formatDate(l.createdAt)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={l.action} color={ACTION_COLOR[l.action]} variant="outlined" />
                    </TableCell>
                    <TableCell>{l.entityType}</TableCell>
                    <TableCell>{l.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Settings = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage your profile, security, and activity" />
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Profile" />
        <Tab label="Security" />
        <Tab label="Activity Log" />
      </Tabs>
      {tab === 0 && <ProfileTab />}
      {tab === 1 && <SecurityTab />}
      {tab === 2 && <ActivityLogTab />}
    </Box>
  );
};

export default Settings;
