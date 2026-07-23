import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Link } from '@mui/material';
import { useSnackbar } from 'notistack';
import { uploadTransactionReceipt, removeTransactionReceipt } from '../../api/transactionApi';

// The backend serves uploads from the API origin, not the frontend origin — strip the
// "/api/v1" suffix from the configured base URL to get back to that origin.
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api/v1').replace(
  /\/api\/v1\/?$/,
  ''
);

const ReceiptDialog = ({ open, onClose, transaction, onUpdated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);

  if (!transaction) return null;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadTransactionReceipt(transaction._id, file);
      onUpdated(data.data);
      enqueueSnackbar('Receipt attached', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Upload failed', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const { data } = await removeTransactionReceipt(transaction._id);
      onUpdated(data.data);
      enqueueSnackbar('Receipt removed', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Remove failed', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Receipt</DialogTitle>
      <DialogContent>
        {transaction.receiptUrl ? (
          <Box textAlign="center" py={1}>
            <Link href={`${API_ORIGIN}${transaction.receiptUrl}`} target="_blank" rel="noreferrer">
              View current receipt
            </Link>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No receipt attached yet.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {transaction.receiptUrl && (
          <Button color="error" onClick={handleRemove}>
            Remove
          </Button>
        )}
        <Button component="label" variant="contained" disabled={uploading}>
          {uploading ? 'Uploading…' : transaction.receiptUrl ? 'Replace' : 'Upload'}
          <input type="file" hidden accept="image/*,application/pdf" onChange={handleUpload} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptDialog;
