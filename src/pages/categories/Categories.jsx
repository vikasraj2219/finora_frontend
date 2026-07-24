import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import AccountTreeIcon from '@mui/icons-material/AccountTreeOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryFormDialog from '../../components/categories/CategoryFormDialog';
import TypeManagerDialog from '../../components/types/TypeManagerDialog';
import SubcategoryManagerDialog from '../../components/subcategories/SubcategoryManagerDialog';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';
import { listTypes } from '../../api/typeApi';

const Categories = () => {
  const { enqueueSnackbar } = useSnackbar();
  // Tabs are driven by the real Type collection (appliesToCategory=true) instead of a
  // hardcoded income/expense pair, so a custom type added via "Manage Types" shows up
  // as its own tab automatically.
  const [types, setTypes] = useState([]);
  const [tab, setTab] = useState('');
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [typeManagerOpen, setTypeManagerOpen] = useState(false);
  const [subcategoryTarget, setSubcategoryTarget] = useState(null);

  const loadTypes = useCallback(async () => {
    const { data } = await listTypes({ appliesToCategory: true });
    setTypes(data.data);
    setTab((current) => current || data.data[0]?.code || '');
  }, []);

  const loadCategories = useCallback(async () => {
    if (!tab) return;
    const { data } = await listCategories({ type: tab });
    setCategories(data.data);
  }, [tab]);

  useEffect(() => {
    loadTypes().catch(() => enqueueSnackbar('Failed to load types', { variant: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab) {
      loadCategories().catch(() => enqueueSnackbar('Failed to load categories', { variant: 'error' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const submit = async (values) => {
    try {
      if (editing) {
        await updateCategory(editing._id, values);
        enqueueSnackbar('Category updated', { variant: 'success' });
      } else {
        await createCategory(values);
        enqueueSnackbar('Category added', { variant: 'success' });
      }
      setDialogOpen(false);
      setEditing(null);
      loadCategories();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleteTarget._id);
      enqueueSnackbar('Category deleted', { variant: 'success' });
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Categories"
        subtitle="Organize how your income and expenses are classified"
        action={
          <Box display="flex" gap={1}>
            <Button startIcon={<TuneIcon />} variant="outlined" onClick={() => setTypeManagerOpen(true)}>
              Manage Types
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              Add Category
            </Button>
          </Box>
        }
      />

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {types.map((t) => (
          <Tab key={t.code} label={t.label} value={t.code} />
        ))}
      </Tabs>

      {types.length === 0 ? (
        <EmptyState
          icon={TuneIcon}
          title="No category-eligible types yet"
          description="Add a type (like Income or Expense) before you can create categories under it."
          actionLabel="Manage Types"
          onAction={() => setTypeManagerOpen(true)}
        />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={CategoryIcon}
          title={`No categories yet`}
          description="Add a category to start organizing your transactions."
          actionLabel="Add Category"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          bgcolor: `${cat.color}1A`,
                          color: cat.color,
                        }}
                      />
                      <Box>
                        <Typography fontWeight={600}>{cat.name}</Typography>
                        {cat.isDefault && <Chip size="small" label="Default" sx={{ mt: 0.5 }} />}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(cat);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(cat)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Tooltip title="Manage subcategories">
                    <Button
                      size="small"
                      startIcon={<AccountTreeIcon fontSize="small" />}
                      sx={{ mt: 1.5 }}
                      onClick={() => setSubcategoryTarget(cat)}
                    >
                      Subcategories
                    </Button>
                  </Tooltip>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        initialValues={editing}
        defaultType={tab}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this category?"
        description="Transactions already using this category will keep their history but you won't be able to select it for new ones."
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <TypeManagerDialog
        open={typeManagerOpen}
        onClose={() => setTypeManagerOpen(false)}
        onChanged={loadTypes}
      />

      <SubcategoryManagerDialog
        open={Boolean(subcategoryTarget)}
        category={subcategoryTarget}
        onClose={() => setSubcategoryTarget(null)}
      />
    </Box>
  );
};

export default Categories;
