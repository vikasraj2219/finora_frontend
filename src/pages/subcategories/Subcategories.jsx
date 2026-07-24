import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Card,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AccountTreeIcon from '@mui/icons-material/AccountTreeOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SubcategoryFormDialog from '../../components/subcategories/SubcategoryFormDialog';
import { listTypes } from '../../api/typeApi';
import { listCategories } from '../../api/categoryApi';
import { listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '../../api/subcategoryApi';

// Full-page home for Subcategory management (Type → Category → Subcategory, spec
// section 6). Type tabs narrow the category dropdown, the category dropdown narrows
// the subcategory list — the same cascade used when allocating a transaction. Same
// CRUD as the per-category "Subcategories" dialog on the Categories page, promoted to
// its own sidebar destination for browsing without needing to open a specific category
// card first.
const Subcategories = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [types, setTypes] = useState([]);
  const [typeTab, setTypeTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategories, setSubcategories] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTypes = useCallback(async () => {
    const { data } = await listTypes({ appliesToCategory: true });
    setTypes(data.data);
    setTypeTab((current) => current || data.data[0]?.code || '');
  }, []);

  const loadCategories = useCallback(async () => {
    if (!typeTab) return;
    const { data } = await listCategories({ type: typeTab });
    setCategories(data.data);
    setCategoryId((current) =>
      data.data.some((c) => c._id === current) ? current : data.data[0]?._id || ''
    );
  }, [typeTab]);

  const loadSubcategories = useCallback(async () => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    const { data } = await listSubcategories({ category: categoryId });
    setSubcategories(data.data);
  }, [categoryId]);

  useEffect(() => {
    loadTypes().catch(() => enqueueSnackbar('Failed to load types', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeTab) loadCategories().catch(() => enqueueSnackbar('Failed to load categories', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeTab]);

  useEffect(() => {
    loadSubcategories().catch(() => enqueueSnackbar('Failed to load subcategories', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const selectedCategory = categories.find((c) => c._id === categoryId);

  const submit = async (values) => {
    try {
      if (editing) {
        await updateSubcategory(editing._id, values);
        enqueueSnackbar('Subcategory updated', { variant: 'success' });
      } else {
        await createSubcategory({ ...values, category: categoryId });
        enqueueSnackbar('Subcategory added', { variant: 'success' });
      }
      setFormOpen(false);
      setEditing(null);
      loadSubcategories();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteSubcategory(deleteTarget._id);
      enqueueSnackbar('Subcategory deleted', { variant: 'success' });
      setDeleteTarget(null);
      loadSubcategories();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Subcategories"
        subtitle="Break a category down further — Type → Category → Subcategory"
        action={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            disabled={!categoryId}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add Subcategory
          </Button>
        }
      />

      <Tabs
        value={typeTab}
        onChange={(e, v) => setTypeTab(v)}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {types.map((t) => (
          <Tab key={t.code} label={t.label} value={t.code} />
        ))}
      </Tabs>

      {categories.length === 0 ? (
        <EmptyState
          icon={CategoryIcon}
          title="No categories under this type yet"
          description="Add a category first — subcategories nest under a category."
        />
      ) : (
        <>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              select
              size="small"
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              sx={{ minWidth: 260 }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {subcategories.length === 0 ? (
            <EmptyState
              icon={AccountTreeIcon}
              title="No subcategories yet"
              description={`Add one to break "${selectedCategory?.name}" down further.`}
              actionLabel="Add Subcategory"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <Card>
              <List disablePadding>
                {subcategories.map((s) => (
                  <ListItem
                    key={s._id}
                    divider
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
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {s.name}
                          </Box>
                          {s.isDefault && <Chip size="small" label="Default" />}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          )}
        </>
      )}

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
    </Box>
  );
};

export default Subcategories;
