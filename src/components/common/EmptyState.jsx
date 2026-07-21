import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    py={6}
    px={2}
  >
    {Icon && (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: 'text.secondary',
        }}
      >
        <Icon />
      </Box>
    )}
    <Typography variant="subtitle1" fontWeight={600}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" maxWidth={360} mt={0.5}>
        {description}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction} sx={{ mt: 2.5 }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
