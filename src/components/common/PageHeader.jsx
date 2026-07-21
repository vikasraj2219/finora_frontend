import { Box, Typography, Stack } from '@mui/material';

// Consistent page title + subtitle + right-aligned action slot, used across every module page.
const PageHeader = ({ title, subtitle, action }) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    spacing={2}
    mb={3}
  >
    <Box>
      <Typography variant="h5">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Stack>
);

export default PageHeader;
