import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '@pdm/shared/api';
import { labelTemplatesApi } from '../api/labelTemplatesApi';
import type { LabelTemplate, LabelTemplateInput } from '../models/labelTemplate';
import { dateInputToIso, toDateInput } from '../utils/dates';

const schema = z.object({
  product: z.string().trim().min(1, 'Le code produit est requis.'),
  labelTypeUid: z.string().trim().min(1, "Le type d'étiquette est requis."),
  templateFile: z.string().trim().min(1, 'Le fichier modèle est requis.'),
  photo: z.string().trim(),
  startDate: z.string().min(1, 'La date de début est requise.'),
  endDate: z.string().min(1, 'La date de fin est requise.'),
}).refine((value) => value.endDate >= value.startDate, {
  message: 'La date de fin doit être postérieure à la date de début.',
  path: ['endDate'],
});

type FormValues = z.infer<typeof schema>;
type TemplateDialogProps = {
  open: boolean;
  template: LabelTemplate | null;
  operatorUid: string;
  saving: boolean;
  mutationError: unknown;
  onClose: () => void;
  onSubmit: (value: LabelTemplate | LabelTemplateInput) => void;
};

const today = () => new Date().toISOString().slice(0, 10);
const defaultValues: FormValues = { product: '', labelTypeUid: '', templateFile: '', photo: '', startDate: today(), endDate: '9999-12-31' };

export function TemplateDialog({ open, template, operatorUid, saving, mutationError, onClose, onSubmit }: TemplateDialogProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const typesQuery = useQuery({ queryKey: ['label-types'], queryFn: labelTemplatesApi.getLabelTypes, enabled: open });
  const formDefaults = template ? {
    product: template.product,
    labelTypeUid: template.labelTypeUid,
    templateFile: template.templateFile,
    photo: template.photo ?? '',
    startDate: toDateInput(template.startDate),
    endDate: toDateInput(template.endDate),
  } : defaultValues;
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: formDefaults });
  const templateFile = useWatch({ control, name: 'templateFile' });
  const photo = useWatch({ control, name: 'photo' });

  const submit = (values: FormValues) => {
    const input: LabelTemplateInput = {
      ...values,
      startDate: dateInputToIso(values.startDate),
      endDate: dateInputToIso(values.endDate, true),
      userUid: operatorUid,
    };
    onSubmit(template ? { ...input, labelTemplateUid: template.labelTemplateUid } : input);
  };

  const chooseFile = (field: 'templateFile' | 'photo', file?: File) => {
    if (!file) return;
    setValue(field, file.name, { shouldValidate: true, shouldDirty: true });
    if (field === 'photo') {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: 3.5, pb: 2.5 }}>
          <Typography component="span" variant="h2">{template ? 'Modifier le modèle' : 'Nouveau modèle d’étiquette'}</Typography>
          <Typography component="p" color="text.secondary" sx={{ mt: .75 }}>{template ? 'Ajustez les informations et la période de validité.' : 'Associez un modèle d’impression à un produit et à un usage.'}</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
          {Boolean(mutationError) && <Alert severity="error" sx={{ mb: 3 }}>{getApiErrorMessage(mutationError, "L'enregistrement a échoué.")}</Alert>}
          {typesQuery.isError && <Alert severity="warning" sx={{ mb: 3 }}>{getApiErrorMessage(typesQuery.error, "Les types d'étiquette ne peuvent pas être chargés.")}</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            <Stack spacing={2.5}>
              <SectionTitle>Identification</SectionTitle>
              <Controller name="product" control={control} render={({ field }) => <TextField {...field} label="Code produit" required autoFocus error={Boolean(errors.product)} helperText={errors.product?.message} />} />
              <Controller name="labelTypeUid" control={control} render={({ field }) => <FormControl required error={Boolean(errors.labelTypeUid)}><InputLabel id="label-type-label">Type d’étiquette</InputLabel><Select {...field} labelId="label-type-label" label="Type d’étiquette">{(typesQuery.data ?? []).map((type) => <MenuItem key={type.labelTypeUid} value={type.labelTypeUid}>{type.labelTypeUid}</MenuItem>)}</Select>{errors.labelTypeUid && <FormHelperText>{errors.labelTypeUid.message}</FormHelperText>}</FormControl>} />
              <SectionTitle>Période de validité</SectionTitle>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Controller name="startDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de début" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.startDate)} helperText={errors.startDate?.message} />} />
                <Controller name="endDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Date de fin" required slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.endDate)} helperText={errors.endDate?.message} />} />
              </Box>
            </Stack>
            <Stack spacing={2.5}>
              <SectionTitle>Fichiers référencés</SectionTitle>
              <FileField label="Fichier du modèle" value={templateFile} error={errors.templateFile?.message} icon={<AttachFileRoundedIcon />} accept=".btw,.lbl,.xml,.zpl,.txt" onChange={(file) => chooseFile('templateFile', file)} />
              <FileField label="Photo de repérage" value={photo} icon={<ImageOutlinedIcon />} accept="image/*" onChange={(file) => chooseFile('photo', file)} />
              {photoPreview && <Box component="img" src={photoPreview} alt="Aperçu de la photo" sx={{ maxHeight: 170, width: '100%', objectFit: 'contain', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }} />}
              <Alert severity="info" variant="outlined">L’API actuelle enregistre le nom du fichier. Le contenu du fichier n’est pas téléversé par cet écran.</Alert>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}><Button variant="outlined" onClick={onClose} disabled={saving}>Annuler</Button><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Enregistrement…' : template ? 'Enregistrer' : 'Créer le modèle'}</Button></DialogActions>
      </Box>
    </Dialog>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <Typography variant="h3">{children}</Typography>;
}

type FileFieldProps = { label: string; value: string; error?: string; accept: string; icon: ReactNode; onChange: (file?: File) => void };
function FileField({ label, value, error, accept, icon, onChange }: FileFieldProps) {
  return <Box sx={{ p: 2, border: '1px solid', borderColor: error ? 'error.main' : value ? '#9CCFBC' : 'divider', borderRadius: 2.5, bgcolor: value ? '#F5FBF8' : '#F8F9FB' }}><Typography sx={{ fontWeight: 750, mb: 1.25 }}>{label}</Typography><Button component="label" variant="outlined" startIcon={icon} fullWidth sx={{ justifyContent: 'flex-start', overflow: 'hidden' }}><Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || 'Sélectionner un fichier'}</Box><input hidden type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0])} /></Button>{error && <FormHelperText error>{error}</FormHelperText>}</Box>;
}
