import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getApiErrorMessage } from '../../../shared/api/httpClient';
import { BrandLogo } from '../../../shared/ui/BrandLogo';
import { usersApi } from '../api/usersApi';
import type { User } from '../models/user';

export function OperatorGate({ onSelect }: { onSelect: (operator: User) => void }) {
  const [selectedUid, setSelectedUid] = useState('');
  const usersQuery = useQuery({ queryKey: ['current-users'], queryFn: usersApi.getCurrent });
  const submit = () => {
    const selected = usersQuery.data?.find((user) => user.userUid === selectedUid);
    if (selected) onSelect(selected);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F5F6F8', p: { xs: 2, sm: 4 } }}>
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}><BrandLogo /></Box>
        <Paper elevation={0} sx={{ width: '100%', p: { xs: 3, sm: 5 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, boxShadow: '0 12px 35px rgba(32,47,108,.06)' }}>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 750 }}>Production Data Manager</Typography>
          <Typography component="h1" variant="h1" sx={{ mt: 1 }}>Prise de poste</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Sélectionnez votre identité pour assurer la traçabilité des modifications.</Typography>
          {usersQuery.isPending && <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={32} /></Box>}
          {usersQuery.isError && <Alert severity="error" sx={{ mt: 3 }} action={<Button color="inherit" onClick={() => usersQuery.refetch()}>Réessayer</Button>}>{getApiErrorMessage(usersQuery.error, 'Les opérateurs ne peuvent pas être chargés.')}</Alert>}
          {usersQuery.isSuccess && <Stack spacing={3} sx={{ mt: 4 }}><FormControl fullWidth><InputLabel id="operator-label">Opérateur</InputLabel><Select labelId="operator-label" label="Opérateur" value={selectedUid} onChange={(event) => setSelectedUid(event.target.value)} autoFocus>{usersQuery.data.map((user) => <MenuItem key={user.userUid} value={user.userUid}>{user.lastName} {user.firstName}{user.department ? ` · ${user.department}` : ''}</MenuItem>)}</Select></FormControl>{usersQuery.data.length === 0 && <Alert severity="warning">Aucun opérateur actif n’est disponible.</Alert>}<Button variant="contained" size="large" disabled={!selectedUid} endIcon={<ArrowForwardRoundedIcon />} onClick={submit}>Accéder aux modèles</Button></Stack>}
        </Paper>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.5, textAlign: 'center' }}>Gestion des modèles d’étiquettes</Typography>
      </Box>
    </Box>
  );
}
