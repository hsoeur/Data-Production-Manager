import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '@pdm/shared/api';
import type { SolderingProgram, SolderingProgramCreateInput } from '../models/solderingProgram';

const schema = z.object({
  productUid: z.string().trim().min(1, 'Le code produit est requis.'),
  program: z.number().int('Le numéro doit être un entier.').positive('Le numéro doit être strictement positif.'),
  side: z.enum(['FC', 'FS'], { message: 'La face est requise.' }),
});

type FormValues = z.infer<typeof schema>;
type SolderingProgramDialogProps = {
  open: boolean;
  program: SolderingProgram | null;
  operatorUid: string;
  saving: boolean;
  mutationError: unknown;
  onClose: () => void;
  onSubmit: (value: SolderingProgram | SolderingProgramCreateInput) => void;
};

const defaultValues: FormValues = { productUid: '', program: 1, side: 'FC' };

export function SolderingProgramDialog({ open, program, operatorUid, saving, mutationError, onClose, onSubmit }: SolderingProgramDialogProps) {
  const formDefaults: FormValues = program ? { productUid: program.productUid, program: program.program, side: program.side } : defaultValues;
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: formDefaults });

  const submit = (values: FormValues) => {
    if (program) {
      onSubmit({ ...program, program: values.program, userUid: operatorUid });
      return;
    }
    onSubmit({ productUid: values.productUid.trim(), program: values.program, side: values.side, userUid: operatorUid });
  };

  return <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
      <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: 3.5, pb: 2.5 }}><Typography component="span" variant="h2">{program ? 'Modifier le programme' : 'Nouveau programme de soudure'}</Typography><Typography component="p" color="text.secondary" sx={{ mt: .75 }}>{program ? 'Seul le numéro du programme actif peut être modifié.' : 'Associez un numéro de programme et une face à un produit.'}</Typography></DialogTitle>
      <Divider />
      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
        {Boolean(mutationError) && <Alert severity="error" sx={{ mb: 3 }}>{getApiErrorMessage(mutationError, "L’enregistrement a échoué.")}</Alert>}
        <Stack spacing={2.5}>
          <Controller name="productUid" control={control} render={({ field }) => <TextField {...field} label="Code produit" required autoFocus={!program} disabled={Boolean(program)} error={Boolean(errors.productUid)} helperText={errors.productUid?.message ?? 'Identifiant figurant sur la fiche produit'} />} />
          <Controller name="program" control={control} render={({ field }) => <TextField {...field} type="number" label="Numéro de programme" required autoFocus={Boolean(program)} slotProps={{ htmlInput: { min: 1, step: 1 } }} onChange={(event) => field.onChange(Number(event.target.value))} error={Boolean(errors.program)} helperText={errors.program?.message} />} />
          <Controller name="side" control={control} render={({ field }) => <FormControl required disabled={Boolean(program)} error={Boolean(errors.side)}><InputLabel id="side-label">Face</InputLabel><Select {...field} labelId="side-label" label="Face"><MenuItem value="FC">FC — Face composants</MenuItem><MenuItem value="FS">FS — Face soudure</MenuItem></Select>{errors.side && <FormHelperText>{errors.side.message}</FormHelperText>}</FormControl>} />
          {program && <Alert severity="info" variant="outlined">Le produit, la face et la période de validité sont conservés. La modification sera tracée avec l’opérateur actif.</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}><Button variant="outlined" onClick={onClose} disabled={saving}>Annuler</Button><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Enregistrement…' : program ? 'Enregistrer' : 'Créer le programme'}</Button></DialogActions>
    </Box>
  </Dialog>;
}
