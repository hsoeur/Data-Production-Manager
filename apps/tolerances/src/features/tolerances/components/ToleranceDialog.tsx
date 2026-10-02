import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '@pdm/shared/api';
import { tolerancesApi } from '../api/tolerancesApi';
import type { Tolerance, ToleranceInput, ToleranceMode } from '../models/tolerance';
import { toleranceModes, toleranceUnits } from '../models/options';
import { dateInputToIso, toDateInput } from '../utils/dates';

const schema = z.object({
  productUid: z.string().trim().min(1, 'Le produit est requis.'),
  operationNumber: z.number().int().nonnegative('Le numéro d’opération doit être positif.'),
  machineUid: z.string().trim().min(1, 'La machine est requise.'),
  label: z.string().trim().min(1, 'La caractéristique est requise.'),
  mode: z.enum(['Between', 'Equal', 'Min', 'Max', 'Record', 'Entry']),
  val1: z.string().trim(),
  val2: z.string().trim(),
  unitUid: z.string().trim().min(1, 'L’unité est requise.'),
  startDate: z.string().min(1, 'La date de début est requise.'),
  endDate: z.string().min(1, 'La date de fin est requise.'),
}).superRefine((value, context) => {
  if (!['Record', 'Entry'].includes(value.mode) && !value.val1) context.addIssue({ code: 'custom', path: ['val1'], message: 'La première valeur est requise.' });
  if (value.mode === 'Between' && !value.val2) context.addIssue({ code: 'custom', path: ['val2'], message: 'La seconde valeur est requise.' });
  if (value.endDate <= value.startDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'La date de fin doit être postérieure à la date de début.' });
});

type FormValues = z.infer<typeof schema>;
type ToleranceDialogProps = {
  open: boolean;
  tolerance: Tolerance | null;
  operatorUid: string;
  saving: boolean;
  mutationError: unknown;
  onClose: () => void;
  onSubmit: (value: Tolerance | ToleranceInput) => void;
};

const today = () => new Date().toISOString().slice(0, 10);
const emptyValues: FormValues = { productUid: '', operationNumber: 10, machineUid: '', label: '', mode: 'Between', val1: '', val2: '', unitUid: '', startDate: today(), endDate: '9999-12-31' };

export function ToleranceDialog({ open, tolerance, operatorUid, saving, mutationError, onClose, onSubmit }: ToleranceDialogProps) {
  const machinesQuery = useQuery({ queryKey: ['machines'], queryFn: tolerancesApi.getMachines, enabled: open });
  const defaults: FormValues = tolerance ? {
    productUid: tolerance.productUid, operationNumber: tolerance.operationNumber, machineUid: tolerance.machineUid,
    label: tolerance.label, mode: tolerance.mode, val1: tolerance.val1, val2: tolerance.val2, unitUid: tolerance.unitUid,
    startDate: toDateInput(tolerance.startDate), endDate: toDateInput(tolerance.endDate),
  } : emptyValues;
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });
  const mode = useWatch({ control, name: 'mode' });
  const valuesDisabled = mode === 'Record' || mode === 'Entry';

  const submit = (values: FormValues) => {
    const input: ToleranceInput = {
      ...values,
      mode: values.mode as ToleranceMode,
      val1: valuesDisabled ? '' : values.val1,
      val2: values.mode === 'Between' ? values.val2 : '',
      startDate: dateInputToIso(values.startDate),
      endDate: dateInputToIso(values.endDate, true),
      userUid: operatorUid,
    };
    onSubmit(tolerance ? { ...input, toleranceUid: tolerance.toleranceUid } : input);
  };

  return <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
      <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: 3.5, pb: 2.5 }}><Typography component="span" variant="h2">{tolerance ? 'Modifier la tolérance' : 'Nouvelle tolérance'}</Typography><Typography component="p" color="text.secondary" sx={{ mt: .75 }}>Définissez le contrôle appliqué à une caractéristique de production.</Typography></DialogTitle>
      <Divider />
      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
        {Boolean(mutationError) && <Alert severity="error" sx={{ mb: 3 }}>{getApiErrorMessage(mutationError, "L’enregistrement a échoué.")}</Alert>}
        {machinesQuery.isError && <Alert severity="warning" sx={{ mb: 3 }}>{getApiErrorMessage(machinesQuery.error, 'Les machines ne peuvent pas être chargées.')}</Alert>}
        <Stack spacing={3}>
          <SectionTitle>Contexte de production</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr .55fr' }, gap: 2 }}>
            <Controller name="productUid" control={control} render={({ field }) => <TextField {...field} label="Produit" required autoFocus error={Boolean(errors.productUid)} helperText={errors.productUid?.message} />} />
            <Controller name="operationNumber" control={control} render={({ field }) => <TextField {...field} type="number" label="N° opération" required onChange={(event) => field.onChange(Number(event.target.value))} error={Boolean(errors.operationNumber)} helperText={errors.operationNumber?.message} />} />
          </Box>
          <Controller name="machineUid" control={control} render={({ field }) => <FormControl required error={Boolean(errors.machineUid)}><InputLabel id="machine-label">Machine</InputLabel><Select {...field} labelId="machine-label" label="Machine">{(machinesQuery.data ?? []).map((machine) => <MenuItem key={machine.machineUid} value={machine.machineUid}>{machine.label} · {machine.machineUid}</MenuItem>)}</Select>{errors.machineUid && <FormHelperText>{errors.machineUid.message}</FormHelperText>}</FormControl>} />

          <SectionTitle>Critère de contrôle</SectionTitle>
          <Controller name="label" control={control} render={({ field }) => <TextField {...field} label="Caractéristique mesurée" required placeholder="Ex. Tension, température…" error={Boolean(errors.label)} helperText={errors.label?.message} />} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Controller name="mode" control={control} render={({ field }) => <FormControl required><InputLabel id="mode-label">Mode</InputLabel><Select {...field} labelId="mode-label" label="Mode">{toleranceModes.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select></FormControl>} />
            <Controller name="unitUid" control={control} render={({ field }) => <FormControl required error={Boolean(errors.unitUid)}><InputLabel id="unit-label">Unité</InputLabel><Select {...field} labelId="unit-label" label="Unité">{toleranceUnits.map((option) => <MenuItem key={option.value} value={option.value}>{option.value} · {option.label}</MenuItem>)}</Select>{errors.unitUid && <FormHelperText>{errors.unitUid.message}</FormHelperText>}</FormControl>} />
          </Box>
          {!valuesDisabled && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: mode === 'Between' ? '1fr 1fr' : '1fr' }, gap: 2 }}><Controller name="val1" control={control} render={({ field }) => <TextField {...field} label={mode === 'Between' ? 'Valeur basse' : 'Valeur'} required error={Boolean(errors.val1)} helperText={errors.val1?.message} />} />{mode === 'Between' && <Controller name="val2" control={control} render={({ field }) => <TextField {...field} label="Valeur haute" required error={Boolean(errors.val2)} helperText={errors.val2?.message} />} />}</Box>}

          <SectionTitle>Période de validité</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><Controller name="startDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de début" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.startDate)} helperText={errors.startDate?.message} />} /><Controller name="endDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de fin" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.endDate)} helperText={errors.endDate?.message} />} /></Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}><Button variant="outlined" onClick={onClose} disabled={saving}>Annuler</Button><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Enregistrement…' : tolerance ? 'Enregistrer' : 'Créer la tolérance'}</Button></DialogActions>
    </Box>
  </Dialog>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Typography variant="h3">{children}</Typography>;
}
