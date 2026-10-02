import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import type { Firmware } from '../models/firmware';

type FirmwareStatusDialogProps = {
  firmware: Firmware | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function FirmwareStatusDialog({ firmware, saving, onClose, onConfirm }: FirmwareStatusDialogProps) {
  if (!firmware) return null;
  const activating = firmware.isSuspended;
  return <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
    <DialogTitle>{activating ? 'Réactiver' : 'Suspendre'} le firmware ?</DialogTitle>
    <DialogContent><Typography color="text.secondary">{firmware.product} · {firmware.label} · version {firmware.version}</Typography></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Annuler</Button><Button variant="contained" color={activating ? 'success' : 'primary'} loading={saving} onClick={onConfirm}>{activating ? 'Réactiver' : 'Suspendre'}</Button></DialogActions>
  </Dialog>;
}
