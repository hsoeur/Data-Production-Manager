import { Chip } from '@mui/material';
import type { NotificationProcessingStatus } from '../models/databaseNotification';

export function NotificationStatus({ status }: { status: NotificationProcessingStatus }) {
  const state = status === 'PROCESSED'
    ? { label: 'Traitée', background: '#E8F5EE', color: '#12623D' }
    : status === 'ERROR'
      ? { label: 'En erreur', background: '#FEF0EF', color: '#B42318' }
      : { label: 'À traiter', background: '#FFF4E8', color: '#8A3505' };
  return <Chip size="small" label={state.label} sx={{ bgcolor: state.background, color: state.color, fontWeight: 800 }} />;
}
