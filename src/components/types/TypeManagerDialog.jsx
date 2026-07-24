import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useSnackbar } from 'notistack';
import TypeFormDialog from './TypeFormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import { listTypes, createType, updateType, deleteType } from '../../api/typeApi';

// Lets a user see every Type (system + their own custom ones), add a new custom type,
// edit label/icon/color/appliesToCategory on any type, and delete a custom type (system
// types can't be deleted — the backend rejects it, and the delete action is hidden here
// to match). onChanged fires after any successful save/delete so the parent (Categories
// page) can refresh its type-driven tabs.
const TypeManagerDialog = ({ open, onClose, onChanged }) => {
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
    if (open) {
      load().catch(() => enqueueSnackbar('Failed to load types', { variant: 'error' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      await load();
      onChanged?.();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteType(deleteTarget._id);
      enqueueSnackbar('Type deleted', { variant: 'success' });
      setDeleteTarget(null);
      await load();
      onChanged?.();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Manage Types
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add Type
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <List disablePadding>
            {types.map((t) => (
              <ListItem
                key={t._id}
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
                      <Typography fontWeight={600}>{t.label}</Typography>
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
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default TypeManagerDialog;
