// Central color tokens. Change once here and the whole app (light + dark) updates.
// Brand colors sourced from the Finora logo: deep navy + teal growth arrow.
export const brand = {
  navy: '#0B2643',
  navyDark: '#071A30',
  navyLight: '#123A63',
  teal: '#12A59D',
  tealLight: '#3FC7BE',
};

export const getPalette = (mode) => ({
  mode,
  primary: {
    main: brand.navy,
    light: brand.navyLight,
    dark: brand.navyDark,
    contrastText: '#ffffff',
  },
  secondary: {
    main: brand.teal,
    light: brand.tealLight,
    dark: '#0C7F79',
    contrastText: '#ffffff',
  },
  success: { main: '#22C55E' },
  warning: { main: '#F59E0B' },
  error: { main: '#EF4444' },
  info: { main: '#3B82F6' },
  background:
    mode === 'light'
      ? { default: '#F5F7FA', paper: '#FFFFFF' }
      : { default: '#08131F', paper: '#0E1F32' },
  divider: mode === 'light' ? 'rgba(11, 38, 67, 0.10)' : 'rgba(255, 255, 255, 0.08)',
});
