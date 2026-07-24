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
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import { useSnackbar } from 'notistack';
import SubcategoryFormDialog from './SubcategoryFormDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import {
  listSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../../api/subcategoryApi';

// Manages the subcategories nested under a single category (Type → Category →
// Subcategory). `category` is the parent Category object the list is scoped to —
// re-fetches whenever it changes or the dialog is reopened.
const SubcategoryManagerDialog = ({ open, onClose, category }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [subcategories, setSubcategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    if (!category) return;
    const { data } = await listSubcategories({ category: category._id });
    setSubcategories(data.data);
  }, [category]);

  useEffect(() => {
    if (open && category) {
      load().catch(() => enqueueSnackbar('Failed to load subcategories', { variant: 'error' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const submit = async (values) => {
    try {
      if (editing) {
        await updateSubcategory(editing._id, values);
        enqueueSnackbar('Subcategory updated', { variant: 'success' });
      } else {
        await createSubcategory({ ...values, category: category._id });
        enqueueSnackbar('Subcategory added', { variant: 'success' });
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteSubcategory(deleteTarget._id);
      enqueueSnackbar('Subcategory deleted', { variant: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <span>Subcategories {category ? `· ${category.name}` : ''}</span>
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add Subcategory
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {subcategories.length === 0 ? (
            <EmptyState
              icon={CategoryIcon}
              title="No subcategories yet"
              description={`Add one to break "${category?.name}" down further.`}
              actionLabel="Add Subcategory"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <List disablePadding>
              {subcategories.map((s) => (
                <ListItem
                  key={s._id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(s);
                          setFormOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(s)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>{s.name}</Typography>
                        {s.isDefault && <Chip size="small" label="Default" />}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <SubcategoryFormDialog
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
        title="Delete this subcategory?"
        description="Transactions already using it will keep their history but you won't be able to select it for new ones."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default SubcategoryManagerDialog;
