import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import { AppBar, Avatar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { BrandLogo } from './BrandLogo';

type AppShellProps = PropsWithChildren<{ operatorName: string; onChangeOperator: () => void }>;

export function AppShell({ children, operatorName, onChangeOperator }: AppShellProps) {
  const initials = operatorName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#FFFFFF', color: 'text.primary' }}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, gap: { xs: 1.5, sm: 2.5 }, maxWidth: 1600, width: '100%', mx: 'auto' }}>
          <BrandLogo compact />
          <Box sx={{ flexGrow: 1, minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontWeight: 750, lineHeight: 1.15 }}>Production Data Manager</Typography>
            <Typography variant="caption" color="text.secondary">Modèles d’étiquettes</Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#EEF1F8', color: '#202F6C', fontSize: 13, fontWeight: 800 }}>{initials}</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{operatorName}</Typography>
              <Typography variant="caption" color="text.secondary">Opérateur actif</Typography>
            </Box>
            <Button color="inherit" size="small" startIcon={<ChangeCircleOutlinedIcon />} onClick={onChangeOperator} sx={{ ml: 1, color: 'text.secondary' }}>
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Changer</Box>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth={false} sx={{ maxWidth: 1540, px: { xs: 2, sm: 3, lg: 5 }, py: { xs: 3, md: 4 } }}>{children}</Container>
    </Box>
  );
}
