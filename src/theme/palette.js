// Central color tokens. Change once here and the whole app (light + dark) updates.
export const getPalette = (mode) => ({
  mode,
  primary: {
    main: '#146C43', // emerald — matches the finance brand's "money/growth" identity
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#C9A227', // gold accent
    contrastText: '#0B1410',
  },
  success: { main: '#22C55E' },
  warning: { main: '#F59E0B' },
  error: { main: '#EF4444' },
  info: { main: '#3B82F6' },
  background:
    mode === 'light'
      ? { default: '#F7F8F5', paper: '#FFFFFF' }
      : { default: '#0B1410', paper: '#101A15' },
});
