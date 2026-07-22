import { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Card, CardContent, Typography, IconButton, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MerchantFormDialog from '../../components/merchants/MerchantFormDialog';
import { listMerchants, createMerchant, updateMerchant, deleteMerchant } from '../../api/merchantApi';
import { listCategories } from '../../api/categoryApi';
import { formatCurrency } from '../../utils/formatters';

// Merchants learn a mapping to a default category, so future statement imports can
// auto-suggest the right category for the same payee without manual re-entry.
const Merchants = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const [merchantRes, catRes] = await Promise.all([listMerchants(), listCategories({ type: 'expense' })]);
    setMerchants(merchantRes.data.data);
    setCategories(catRes.data.data);
  }, []);

  useEffect(() => {
    load().catch(() => enqueueSnackbar('Failed to load merchants', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (values) => {
    try {
      if (editing) {
        await updateMerchant(editing._id, values);
        enqueueSnackbar('Merchant updated', { variant: 'success' });
      } else {
        await createMerchant(values);
        enqueueSnackbar('Merchant added', { variant: 'success' });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteMerchant(deleteTarget._id);
      enqueueSnackbar('Merchant deleted', { variant: 'success' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Merchants"
        subtitle="Map payees to a default category so imports auto-categorize themselves"
        action={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add Merchant
          </Button>
        }
      />

      {merchants.length === 0 ? (
        <EmptyState
          icon={StorefrontIcon}
          title="No merchants yet"
          description="Merchants are usually created automatically during statement import — or add one manually here."
          actionLabel="Add Merchant"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={2}>
          {merchants.map((m) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={m._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography fontWeight={600}>{m.name}</Typography>
                      {m.defaultCategory && (
                        <Chip size="small" label={m.defaultCategory.name} sx={{ mt: 0.5 }} />
                      )}
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(m);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(m)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
                    {m.transactionCount || 0} transactions · {formatCurrency(m.totalPaid || 0)} total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <MerchantFormDialog
        open={dialogOpen}
        initialValues={editing}
        categories={categories}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this merchant?"
        description="Past transactions keep their history, but future imports won't auto-match to this merchant anymore."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default Merchants;
