import { Box, Typography, Stack } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Logo from '../common/Logo';
import { brand } from '../../theme/palette';

const FEATURES = [
  { icon: TrendingUpOutlinedIcon, text: 'Track every account and transaction in one place' },
  { icon: PieChartOutlineOutlinedIcon, text: 'See spending patterns with live dashboards' },
  { icon: ShieldOutlinedIcon, text: 'Bank-grade auth with full audit history' },
];

// Shared shell for Login/Register: a navy brand panel on desktop, form area always visible.
const AuthLayout = ({ children }) => (
  <Box minHeight="100vh" display="flex">
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '44%',
        minWidth: 420,
        p: 6,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(160deg, ${brand.navy} 0%, ${brand.navyDark} 100%)`,
        color: '#fff',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.teal}33 0%, transparent 70%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -60,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${brand.teal}22 0%, transparent 70%)`,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderRadius: 2,
            px: 1.75,
            py: 1.25,
            display: 'inline-flex',
          }}
        >
          <Logo variant="mark" height={34} />
        </Box>
      </Box>

      <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        <Box>
          <Typography variant="h3" fontWeight={800} letterSpacing={1}>
            FINORA
          </Typography>
          <Typography
            variant="overline"
            sx={{ color: brand.tealLight, letterSpacing: 3, fontWeight: 700 }}
          >
            Personal Finance Management
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 340 }}>
          One clear view of your money — accounts, spending, and goals, all in one calm dashboard.
        </Typography>
        <Stack spacing={2.5}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <Stack key={text} direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: brand.tealLight,
                  flexShrink: 0,
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                {text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 1 }}>
        © {new Date().getFullYear()} Finora. All rights reserved.
      </Typography>
    </Box>

    <Box
      flexGrow={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      p={2}
    >
      <Box display={{ xs: 'flex', md: 'none' }} justifyContent="center" mb={4}>
        <Logo variant="full" height={34} />
      </Box>
      {children}
    </Box>
  </Box>
);

export default AuthLayout;
