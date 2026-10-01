import { Box } from '@mui/material';

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Box
      sx={{
        width: compact ? { xs: 144, sm: 172 } : { xs: 190, sm: 238 },
        height: compact ? 42 : 64,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src="/brand/amphitech-rvb.png"
        alt="Amphitech"
        sx={{ width: '116%', maxWidth: 'none', display: 'block' }}
      />
    </Box>
  );
}
