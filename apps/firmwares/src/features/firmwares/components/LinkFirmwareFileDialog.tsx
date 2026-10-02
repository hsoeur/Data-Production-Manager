import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { getApiErrorMessage } from '@pdm/shared/api';
import type { Firmware } from '../models/firmware';

type LinkFirmwareFileDialogProps = {
  open: boolean;
  firmware: Firmware | null;
  saving: boolean;
  mutationError: unknown;
  onClose: () => void;
  onSubmit: (file: string) => void;
};

export function LinkFirmwareFileDialog({ open, firmware, saving, mutationError, onClose, onSubmit }: LinkFirmwareFileDialogProps) {
  const [file, setFile] = useState(firmware?.file ?? '');
  if (!firmware) return null;
  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>Lier un fichier firmware</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>{firmware.product} · {firmware.label} · version {firmware.version}</Typography>
      {Boolean(mutationError) && <Alert severity="error" sx={{ mb: 2 }}>{getApiErrorMessage(mutationError, 'La liaison du fichier a échoué.')}</Alert>}
      <TextField fullWidth autoFocus label="Nom ou chemin du fichier" value={file} onChange={(event) => setFile(event.target.value)} error={!file.trim()} helperText={!file.trim() ? 'Le fichier est obligatoire.' : 'Cette action met à jour le fichier de la version courante.'} />
    </DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Annuler</Button><Button variant="contained" loading={saving} disabled={!file.trim()} onClick={() => onSubmit(file.trim())}>Lier le fichier</Button></DialogActions>
  </Dialog>;
}
