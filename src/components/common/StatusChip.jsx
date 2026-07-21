import { Chip } from '@mui/material';

// isActive -> green "Active" / grey "Inactive" chip, reused on every account/entity list.
const StatusChip = ({ isActive }) => (
  <Chip
    label={isActive ? 'Active' : 'Inactive'}
    size="small"
    color={isActive ? 'success' : 'default'}
    variant={isActive ? 'filled' : 'outlined'}
  />
);

export default StatusChip;
