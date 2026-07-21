import { Card, CardContent, Typography, Box } from '@mui/material';

// Reusable dashboard stat widget — icon, label, value, optional trend/subtext.
const StatCard = ({ icon: Icon, label, value, color = 'primary.main', subtext }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        {Icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: `${color}1A`,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon fontSize="small" />
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
      {subtext && (
        <Typography variant="caption" color="text.secondary">
          {subtext}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
