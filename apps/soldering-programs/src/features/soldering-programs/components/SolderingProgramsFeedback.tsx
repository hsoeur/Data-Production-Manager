import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';

type SolderingProgramsFeedbackProps = {
  kind: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
};

export function SolderingProgramsFeedback({ kind, message, onRetry }: SolderingProgramsFeedbackProps) {
  return <Paper variant="outlined" sx={{ minHeight: 340, display: 'grid', placeItems: 'center', p: 3 }}>
    {kind === 'loading' && <Box sx={{ textAlign: 'center' }}><CircularProgress size={36} /><Typography variant="h2" sx={{ mt: 2.5 }}>Chargement des programmes</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Les données de production sont en cours de récupération.</Typography></Box>}
    {kind === 'error' && <Alert severity="error" icon={<ErrorOutlineRoundedIcon />} action={onRetry ? <Button color="inherit" onClick={onRetry}>Réessayer</Button> : undefined} sx={{ width: '100%', maxWidth: 680 }}><Typography sx={{ fontWeight: 800 }}>Impossible de charger les programmes</Typography><Typography variant="body2">{message}</Typography></Alert>}
    {kind === 'empty' && <Box sx={{ textAlign: 'center' }}><Inventory2OutlinedIcon sx={{ fontSize: 46, color: '#98A2B3' }} /><Typography variant="h2" sx={{ mt: 1.5 }}>Aucun programme trouvé</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{message ?? 'Modifiez les critères de recherche.'}</Typography></Box>}
  </Paper>;
}
