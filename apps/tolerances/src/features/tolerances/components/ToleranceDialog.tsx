import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '@pdm/shared/api';
import { useDebouncedValue } from '@pdm/shared/hooks';
import { tolerancesApi } from '../api/tolerancesApi';
import type { Tolerance, ToleranceInput, ToleranceMode } from '../models/tolerance';
import { toleranceModes, toleranceUnits } from '../models/options';
import { dateInputToIso, toDateInput } from '../utils/dates';

const schema = z.object({
  productUid: z.string().trim().min(1, 'Le produit est requis.'),
  operationNumber: z.number().int().nonnegative('Sélectionnez une opération.'),
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
const emptyValues: FormValues = { productUid: '', operationNumber: -1, machineUid: '', label: '', mode: 'Between', val1: '', val2: '', unitUid: '', startDate: today(), endDate: '9999-12-31' };

export function ToleranceDialog({ open, tolerance, operatorUid, saving, mutationError, onClose, onSubmit }: ToleranceDialogProps) {
  const machinesQuery = useQuery({ queryKey: ['machines'], queryFn: tolerancesApi.getMachines, enabled: open && !tolerance });
  const defaults: FormValues = tolerance ? {
    productUid: tolerance.productUid, operationNumber: tolerance.operationNumber, machineUid: tolerance.machineUid,
    label: tolerance.label, mode: tolerance.mode, val1: tolerance.val1, val2: tolerance.val2, unitUid: tolerance.unitUid,
    startDate: toDateInput(tolerance.startDate), endDate: toDateInput(tolerance.endDate),
  } : emptyValues;
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });
  const productUid = useWatch({ control, name: 'productUid' });
  const normalizedProductUid = productUid.trim();
  const debouncedProductUid = useDebouncedValue(normalizedProductUid);
  const operationsReady = Boolean(normalizedProductUid) && normalizedProductUid === debouncedProductUid;
  const operationsQuery = useQuery({
    queryKey: ['operations', { productUid: debouncedProductUid }],
    queryFn: () => tolerancesApi.getOperationsByProductUid(debouncedProductUid),
    enabled: open && !tolerance && Boolean(debouncedProductUid),
  });
  const mode = useWatch({ control, name: 'mode' });
  const valuesDisabled = mode === 'Record' || mode === 'Entry';

  const submit = (values: FormValues) => {
    const mode = values.mode as ToleranceMode;
    const val1 = valuesDisabled ? '' : values.val1;
    const val2 = mode === 'Between' ? values.val2 : '';
    if (tolerance) {
      onSubmit({ ...tolerance, mode, val1, val2, userUid: operatorUid });
      return;
    }
    const input: ToleranceInput = {
      ...values,
      mode,
      val1,
      val2,
      startDate: dateInputToIso(values.startDate),
      endDate: dateInputToIso(values.endDate, true),
      userUid: operatorUid,
    };
    onSubmit(input);
  };

  return <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
      <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: 3.5, pb: 2.5 }}><Typography component="span" variant="h2">{tolerance ? 'Modifier la tolérance' : 'Nouvelle tolérance'}</Typography><Typography component="p" color="text.secondary" sx={{ mt: .75 }}>{tolerance ? 'Seuls le mode et les valeurs du critère peuvent être modifiés.' : 'Définissez le contrôle appliqué à une caractéristique de production.'}</Typography></DialogTitle>
      <Divider />
      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
        {Boolean(mutationError) && <Alert severity="error" sx={{ mb: 3 }}>{getApiErrorMessage(mutationError, "L’enregistrement a échoué.")}</Alert>}
        {machinesQuery.isError && <Alert severity="warning" sx={{ mb: 3 }}>{getApiErrorMessage(machinesQuery.error, 'Les machines ne peuvent pas être chargées.')}</Alert>}
        <Stack spacing={3}>
          <SectionTitle>Contexte de production</SectionTitle>
          {tolerance ? <ReadOnlyContext tolerance={tolerance} /> : <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr .55fr' }, gap: 2 }}>
              <Controller name="productUid" control={control} render={({ field }) => <TextField {...field} label="Produit" required autoFocus onChange={(event) => { field.onChange(event); setValue('operationNumber', -1); }} error={Boolean(errors.productUid)} helperText={errors.productUid?.message} />} />
              <Controller name="operationNumber" control={control} render={({ field }) => {
                const operations = operationsQuery.data ?? [];
                const selectedOperation = operations.find((operation) => operation.operationNumber === field.value) ?? null;
                return <Autocomplete options={operations} value={selectedOperation} onChange={(_, operation) => field.onChange(operation?.operationNumber ?? -1)} getOptionLabel={(operation) => `${operation.operationNumber} · ${operation.label}${operation.machine ? ` · ${operation.machine}` : ''}`} isOptionEqualToValue={(option, value) => option.operationUid === value.operationUid} loading={Boolean(normalizedProductUid) && (!operationsReady || operationsQuery.isFetching)} disabled={!operationsReady || operationsQuery.isError} noOptionsText={normalizedProductUid ? 'Aucune opération pour ce produit' : 'Saisissez d’abord un produit'} loadingText="Chargement des opérations…" renderInput={(params) => <TextField {...params} label="Opération" required error={Boolean(errors.operationNumber) || operationsQuery.isError} helperText={operationsQuery.isError ? getApiErrorMessage(operationsQuery.error, 'Les opérations ne peuvent pas être chargées.') : errors.operationNumber?.message ?? (operationsReady ? 'Sélectionnez une opération proposée.' : normalizedProductUid ? 'Recherche des opérations…' : 'Saisissez d’abord le code produit.')} slotProps={{ input: { ...params.InputProps, endAdornment: <>{Boolean(normalizedProductUid) && (!operationsReady || operationsQuery.isFetching) ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</> } }} />} />;
              }} />
            </Box>
            <Controller name="machineUid" control={control} render={({ field }) => <FormControl required error={Boolean(errors.machineUid)}><InputLabel id="machine-label">Machine</InputLabel><Select {...field} labelId="machine-label" label="Machine">{(machinesQuery.data ?? []).map((machine) => <MenuItem key={machine.machineUid} value={machine.machineUid}>{machine.label} · {machine.machineUid}</MenuItem>)}</Select>{errors.machineUid && <FormHelperText>{errors.machineUid.message}</FormHelperText>}</FormControl>} />
          </>}

          <SectionTitle>Critère de contrôle</SectionTitle>
          {!tolerance && <Controller name="label" control={control} render={({ field }) => <TextField {...field} label="Caractéristique mesurée" required placeholder="Ex. Tension, température…" error={Boolean(errors.label)} helperText={errors.label?.message} />} />}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Controller name="mode" control={control} render={({ field }) => <FormControl required><InputLabel id="mode-label">Mode</InputLabel><Select {...field} autoFocus={Boolean(tolerance)} labelId="mode-label" label="Mode">{toleranceModes.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select></FormControl>} />
            {tolerance ? <ReadOnlyValue label="Unité" value={tolerance.unitUid === 'Char' ? 'Chaîne de caractères' : tolerance.unitUid} /> : <Controller name="unitUid" control={control} render={({ field }) => <FormControl required error={Boolean(errors.unitUid)}><InputLabel id="unit-label">Unité</InputLabel><Select {...field} labelId="unit-label" label="Unité">{toleranceUnits.map((option) => <MenuItem key={option.value} value={option.value}>{option.value === 'Char' ? option.label : `${option.value} · ${option.label}`}</MenuItem>)}</Select>{errors.unitUid && <FormHelperText>{errors.unitUid.message}</FormHelperText>}</FormControl>} />}
          </Box>
          {!valuesDisabled && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: mode === 'Between' ? '1fr 1fr' : '1fr' }, gap: 2 }}><Controller name="val1" control={control} render={({ field }) => <TextField {...field} label={mode === 'Between' ? 'Valeur basse' : 'Valeur'} required error={Boolean(errors.val1)} helperText={errors.val1?.message} />} />{mode === 'Between' && <Controller name="val2" control={control} render={({ field }) => <TextField {...field} label="Valeur haute" required error={Boolean(errors.val2)} helperText={errors.val2?.message} />} />}</Box>}

          {!tolerance && <><SectionTitle>Période de validité</SectionTitle><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><Controller name="startDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de début" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.startDate)} helperText={errors.startDate?.message} />} /><Controller name="endDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de fin" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.endDate)} helperText={errors.endDate?.message} />} /></Box></>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}><Button variant="outlined" onClick={onClose} disabled={saving}>Annuler</Button><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Enregistrement…' : tolerance ? 'Enregistrer' : 'Créer la tolérance'}</Button></DialogActions>
    </Box>
  </Dialog>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Typography variant="h3">{children}</Typography>;
}

function ReadOnlyContext({ tolerance }: { tolerance: Tolerance }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2, p: 2.5, bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
    <ReadOnlyValue label="Produit" value={tolerance.productUid} />
    <ReadOnlyValue label="Opération" value={String(tolerance.operationNumber)} />
    <ReadOnlyValue label="Machine" value={tolerance.machineUid} />
    <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }}><ReadOnlyValue label="Caractéristique" value={tolerance.label} /></Box>
    <ReadOnlyValue label="Validité" value={`${toDateInput(tolerance.startDate)} → ${toDateInput(tolerance.endDate)}`} />
  </Box>;
}

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{value}</Typography></Box>;
}
