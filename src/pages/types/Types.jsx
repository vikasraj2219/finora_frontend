import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TypeFormDialog from '../../components/types/TypeFormDialog';
import { listTypes, createType, updateType, deleteType } from '../../api/typeApi';

// Full-page home for Type management (Type → Category → Subcategory, spec section 4).
// Shows every type — the 5 system types (income/expense/transfer/adjustment/opening
// balance, uneditable code, undeletable) plus any custom category-eligible types this
// user has added. Same CRUD as the "Manage Types" dialog on the Categories page, just
// promoted to its own sidebar destination.
const Types = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [types, setTypes] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const { data } = await listTypes();
    setTypes(data.data);
  }, []);

  useEffect(() => {
    load().catch(() => enqueueSnackbar('Failed to load types', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (values) => {
    try {
      if (editing) {
        const { code, ...rest } = values; // eslint-disable-line no-unused-vars
        await updateType(editing._id, rest);
        enqueueSnackbar('Type updated', { variant: 'success' });
      } else {
        await createType(values);
        enqueueSnackbar('Type added', { variant: 'success' });
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteType(deleteTarget._id);
      enqueueSnackbar('Type deleted', { variant: 'success' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Types"
        subtitle="The transaction types your categories are organized under"
        action={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add Type
          </Button>
        }
      />

      {types.length === 0 ? (
        <EmptyState icon={TuneIcon} title="No types yet" description="Add a type to get started." />
      ) : (
        <Card>
          <List disablePadding>
            {types.map((t) => (
              <ListItem
                key={t._id}
                divider
                secondaryAction={
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditing(t);
                        setFormOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {!t.isSystem && (
                      <IconButton size="small" onClick={() => setDeleteTarget(t)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: t.color || '#64748B',
                          flexShrink: 0,
                        }}
                      />
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {t.label}
                      </Box>
                      <Chip size="small" label={t.code} variant="outlined" />
                      {t.isSystem && <Chip size="small" label="System" />}
                      {t.appliesToCategory && (
                        <Chip size="small" label="Category-eligible" color="success" variant="outlined" />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <TypeFormDialog
        open={formOpen}
        initialValues={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this type?"
        description="This can't be undone. You can't delete a type that's still used by a category."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default Types;
