import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';

type NotificationsFeedbackProps = {
  kind: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
};

export function NotificationsFeedback({ kind, message, onRetry }: NotificationsFeedbackProps) {
  return <Paper variant="outlined" sx={{ minHeight: 340, display: 'grid', placeItems: 'center', p: 3 }}>
    {kind === 'loading' && <Box sx={{ textAlign: 'center' }}><CircularProgress size={36} /><Typography variant="h2" sx={{ mt: 2.5 }}>Synchronisation des notifications</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Les dernières modifications de production sont en cours de récupération.</Typography></Box>}
    {kind === 'error' && <Alert severity="error" icon={<ErrorOutlineRoundedIcon />} action={onRetry ? <Button color="inherit" onClick={onRetry}>Réessayer</Button> : undefined} sx={{ width: '100%', maxWidth: 680 }}><Typography sx={{ fontWeight: 800 }}>Impossible d’afficher les notifications</Typography><Typography variant="body2">{message}</Typography></Alert>}
    {kind === 'empty' && <Box sx={{ textAlign: 'center' }}><NotificationsNoneRoundedIcon sx={{ fontSize: 46, color: '#98A2B3' }} /><Typography variant="h2" sx={{ mt: 1.5 }}>Aucune notification trouvée</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{message ?? 'Les nouvelles désynchronisations apparaîtront ici.'}</Typography></Box>}
  </Paper>;
}
