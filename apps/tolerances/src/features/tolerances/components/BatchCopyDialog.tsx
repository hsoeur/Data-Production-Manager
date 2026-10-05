import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '@pdm/shared/api';
import { tolerancesApi } from '../api/tolerancesApi';
import type { CopyToleranceBatchRequest } from '../models/tolerance';
import { dateInputToIso } from '../utils/dates';

const schema = z.object({
  sourceProductUid: z.string().min(1, 'Le produit source est requis.'),
  targetProductUid: z.string().trim().min(1, 'Le nouveau produit est requis.'),
  startDate: z.string().min(1, 'La date de début est requise.'),
  endDate: z.string().min(1, 'La date de fin est requise.'),
}).refine((value) => value.endDate > value.startDate, { path: ['endDate'], message: 'La date de fin doit être postérieure à la date de début.' });

type FormValues = z.infer<typeof schema>;
type BatchCopyDialogProps = {
  open: boolean;
  operatorUid: string;
  saving: boolean;
  mutationError: unknown;
  onClose: () => void;
  onSubmit: (value: CopyToleranceBatchRequest) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export function BatchCopyDialog({ open, operatorUid, saving, mutationError, onClose, onSubmit }: BatchCopyDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectionError, setSelectionError] = useState(false);
  const tolerancesQuery = useQuery({ queryKey: ['tolerances', { activeOnly: false }], queryFn: () => tolerancesApi.list(false), enabled: open });
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { sourceProductUid: '', targetProductUid: '', startDate: today(), endDate: '9999-12-31' } });
  const sourceProductUid = useWatch({ control, name: 'sourceProductUid' });
  const sourceTolerances = useMemo(() => (tolerancesQuery.data ?? []).filter((item) => item.productUid === sourceProductUid), [sourceProductUid, tolerancesQuery.data]);
  const products = useMemo(() => [...new Set((tolerancesQuery.data ?? []).map((item) => item.productUid))].sort((a, b) => a.localeCompare(b, 'fr')), [tolerancesQuery.data]);

  const chooseSource = (value: string, onChange: (value: string) => void) => {
    onChange(value);
    setSelected((tolerancesQuery.data ?? []).filter((item) => item.productUid === value).map((item) => item.toleranceUid));
    setSelectionError(false);
  };

  const toggle = (uid: string) => {
    setSelected((current) => current.includes(uid) ? current.filter((value) => value !== uid) : [...current, uid]);
    setSelectionError(false);
  };

  const submit = (values: FormValues) => {
    if (selected.length === 0) {
      setSelectionError(true);
      return;
    }
    onSubmit({ sourceProductUid: values.sourceProductUid, targetProductUid: values.targetProductUid.trim(), toleranceUids: selected, startDate: dateInputToIso(values.startDate), endDate: dateInputToIso(values.endDate, true), userUid: operatorUid });
  };

  return <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
      <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: 3.5, pb: 2.5 }}><Stack direction="row" spacing={1.5} alignItems="center"><ContentCopyRoundedIcon color="primary" /><Box><Typography component="span" variant="h2">Dupliquer des tolérances</Typography><Typography component="p" color="text.secondary" sx={{ mt: .5 }}>Préparez un nouveau produit à partir d’une sélection existante.</Typography></Box></Stack></DialogTitle>
      <Divider />
      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
        {Boolean(mutationError) && <Alert severity="error" sx={{ mb: 3 }}>{getApiErrorMessage(mutationError, 'La copie des tolérances a échoué.')}</Alert>}
        {tolerancesQuery.isError && <Alert severity="error" sx={{ mb: 3 }}>{getApiErrorMessage(tolerancesQuery.error, 'Les tolérances sources ne peuvent pas être chargées.')}</Alert>}
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Controller name="sourceProductUid" control={control} render={({ field }) => <FormControl required error={Boolean(errors.sourceProductUid)}><InputLabel id="source-product-label">Produit source</InputLabel><Select {...field} labelId="source-product-label" label="Produit source" onChange={(event) => chooseSource(event.target.value, field.onChange)}>{products.map((product) => <MenuItem key={product} value={product}>{product}</MenuItem>)}</Select>{errors.sourceProductUid && <FormHelperText>{errors.sourceProductUid.message}</FormHelperText>}</FormControl>} />
            <Controller name="targetProductUid" control={control} render={({ field }) => <TextField {...field} label="Nouveau produit" required error={Boolean(errors.targetProductUid)} helperText={errors.targetProductUid?.message} />} />
          </Box>

          <Box><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography variant="h3">Tolérances à copier</Typography>{sourceTolerances.length > 0 && <Button size="small" onClick={() => setSelected(sourceTolerances.map((item) => item.toleranceUid))}>Tout sélectionner</Button>}</Stack>
            {!sourceProductUid ? <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>Sélectionnez d’abord un produit source.</Typography> : <List disablePadding sx={{ maxHeight: 260, overflow: 'auto', border: '1px solid', borderColor: selectionError ? 'error.main' : 'divider', borderRadius: 1.5 }}>{sourceTolerances.map((item) => <ListItem key={item.toleranceUid} disablePadding divider><ListItemButton onClick={() => toggle(item.toleranceUid)}><ListItemIcon><Checkbox edge="start" checked={selected.includes(item.toleranceUid)} tabIndex={-1} disableRipple /></ListItemIcon><ListItemText primary={item.label} secondary={`${item.machineUid} · ${item.operationNumber} · ${item.mode}`} /></ListItemButton></ListItem>)}</List>}
            {selectionError && <FormHelperText error>Au moins une tolérance doit être sélectionnée.</FormHelperText>}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><Controller name="startDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de début" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.startDate)} helperText={errors.startDate?.message} />} /><Controller name="endDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de fin" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.endDate)} helperText={errors.endDate?.message} />} /></Box>
          <Alert severity="info" variant="outlined">La copie est atomique : en cas d’erreur, aucune tolérance ne sera créée.</Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}><Button variant="outlined" onClick={onClose} disabled={saving}>Annuler</Button><Button type="submit" variant="contained" disabled={saving || tolerancesQuery.isPending}>{saving ? 'Copie en cours…' : `Copier ${selected.length || ''} tolérance${selected.length > 1 ? 's' : ''}`}</Button></DialogActions>
    </Box>
  </Dialog>;
}
