import { createTheme } from '@mui/material/styles';
import { getPalette } from './palette';
import { typography } from './typography';

export const createAppTheme = (mode = 'light') =>
  createTheme({
    palette: getPalette(mode),
    typography,
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
    },
  });
