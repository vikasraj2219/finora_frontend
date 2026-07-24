import { Box } from '@mui/material';

/**
 * Brand logo.
 * variant="mark"  -> square icon only (collapsed sidebar, favicon-style spots)
 * variant="full"  -> horizontal lockup (icon + "FINORA" wordmark), used on Sidebar header, auth screens
 */
const Logo = ({ variant = 'full', height = 36, sx = {} }) => {
  const src = variant === 'mark' ? '/logo-mark-square.png' : '/logo-full.png';
  return (
    <Box
      component="img"
      src={src}
      alt="Finora"
      sx={{ height, width: 'auto', display: 'block', ...sx }}
    />
  );
};

export default Logo;
