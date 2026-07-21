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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import { useSnackbar } from 'notistack';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryFormDialog from '../../components/categories/CategoryFormDialog';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';

const Categories = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState('expense');
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const { data } = await listCategories({ type: tab });
    setCategories(data.data);
  }, [tab]);

  useEffect(() => {
    load().catch(() => enqueueSnackbar('Failed to load categories', { variant: 'error' }));
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
      load();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleteTarget._id);
      enqueueSnackbar('Category deleted', { variant: 'success' });
      setDeleteTarget(null);
      load();
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
        }
      />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Expense" value="expense" />
        <Tab label="Income" value="income" />
      </Tabs>

      {categories.length === 0 ? (
        <EmptyState
          icon={CategoryIcon}
          title={`No ${tab} categories yet`}
          description="Add a category to start organizing your transactions."
          actionLabel="Add Category"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
              <Card>
                <CardContent
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
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
    </Box>
  );
};

export default Categories;
