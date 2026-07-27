import { Card, CardContent, Box, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';

// The shared visual language for every "list of named, colored things I can edit/delete"
// screen — Categories, Types, Subcategories. A left accent bar in the item's own color
// (real metadata, not decoration) plus an icon swatch, plus hover-reveal actions on
// desktop (always visible on touch, since there's no hover there).
const ManagedItemCard = ({
  color = '#64748B',
  icon: Icon,
  title,
  badges,
  meta,
  onEdit,
  onDelete,
  deleteDisabledReason,
}) => (
  <Card
    sx={{
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      '&:hover .item-actions': { opacity: 1 },
    }}
  >
    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: color }} />
    <CardContent sx={{ pl: 2.75, py: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
          {Icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 2,
                bgcolor: `${color}1F`,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon fontSize="small" />
            </Box>
          )}
          <Box minWidth={0}>
            <Typography fontWeight={600} noWrap>
              {title}
            </Typography>
            {meta && (
              <Typography variant="caption" color="text.secondary" noWrap component="div">
                {meta}
              </Typography>
            )}
            {badges && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={0.5}>
                {badges}
              </Stack>
            )}
          </Box>
        </Stack>
        <Stack
          direction="row"
          className="item-actions"
          sx={{ opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.15s ease', flexShrink: 0 }}
        >
          {onEdit && (
            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <Tooltip title={deleteDisabledReason || ''}>
              <span>
                <IconButton size="small" onClick={onDelete} disabled={Boolean(deleteDisabledReason)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default ManagedItemCard;
