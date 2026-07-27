import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { getPalette, brand } from './palette';
import { typography } from './typography';

export const createAppTheme = (mode = 'light') =>
  responsiveFontSizes(createTheme({
    palette: getPalette(mode),
    typography,
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '::selection': { backgroundColor: `${brand.teal}33` },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === 'light'
                ? '0 1px 2px rgba(11, 38, 67, 0.06), 0 4px 16px rgba(11, 38, 67, 0.06)'
                : '0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.25)',
            border: '1px solid',
            borderColor: mode === 'light' ? 'rgba(11, 38, 67, 0.06)' : 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
          containedPrimary: {
            backgroundImage: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.navyLight} 100%)`,
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${brand.navyDark} 0%, ${brand.navy} 100%)`,
            },
          },
          containedSecondary: {
            backgroundImage: `linear-gradient(135deg, ${brand.teal} 0%, ${brand.tealLight} 100%)`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'saturate(180%) blur(8px)',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.86)' : 'rgba(14, 31, 50, 0.86)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  }));
