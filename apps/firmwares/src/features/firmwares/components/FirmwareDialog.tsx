import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '@pdm/shared/api';
import type { Firmware } from '../models/firmware';
import { dateInputToIso } from '../utils/dates';

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const schema = z.object({
  version: z.string().trim().min(1, 'La version est obligatoire.'),
  file: z.string().trim().min(1, 'Le nom du fichier est obligatoire.'),
  startDate: z.string().min(1, 'La date d’effet est obligatoire.').refine((value) => value >= today(), 'La date ne peut pas être antérieure à aujourd’hui.'),
});
type FormValues = z.infer<typeof schema>;

type FirmwareDialogProps = {
  open: boolean;
  firmware: Firmware | null;
  operatorUid: string;
  saving: boolean;
  mutationError: unknown;
  onClose: () => void;
  onSubmit: (firmware: Firmware) => void;
};

export function FirmwareDialog({ open, firmware, operatorUid, saving, mutationError, onClose, onSubmit }: FirmwareDialogProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { version: firmware?.version ?? '', file: firmware?.file ?? '', startDate: today() },
  });
  if (!firmware) return null;
  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>Nouvelle version du firmware</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>{firmware.product} · {firmware.label}</Typography>
      <Stack component="form" id="firmware-form" spacing={2} onSubmit={handleSubmit((values) => onSubmit({ ...firmware, ...values, startDate: dateInputToIso(values.startDate), userUid: operatorUid }))}>
        {Boolean(mutationError) && <Alert severity="error">{getApiErrorMessage(mutationError, 'La mise à jour a échoué.')}</Alert>}
        <Controller name="version" control={control} render={({ field }) => <TextField {...field} autoFocus label="Version" error={Boolean(errors.version)} helperText={errors.version?.message} />} />
        <Controller name="file" control={control} render={({ field }) => <TextField {...field} label="Fichier firmware" error={Boolean(errors.file)} helperText={errors.file?.message} />} />
        <Controller name="startDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date d’effet" error={Boolean(errors.startDate)} helperText={errors.startDate?.message ?? 'Aujourd’hui pour une application immédiate, ou une date future pour l’anticiper.'} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today() } }} />} />
      </Stack>
    </DialogContent>
    <DialogActions><Button onClick={onClose} disabled={saving}>Annuler</Button><Button type="submit" form="firmware-form" variant="contained" loading={saving}>Enregistrer</Button></DialogActions>
  </Dialog>;
}
