import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Button, Chip, FormControlLabel, IconButton, InputAdornment, Paper, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { useSnackbar } from 'notistack';
import { getApiErrorMessage } from '../../../shared/api/httpClient';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { AppShell } from '../../../shared/ui/AppShell';
import { FeedbackPanel } from '../../../shared/ui/FeedbackPanel';
import type { User } from '../../operators/models/user';
import { labelTemplatesApi } from '../api/labelTemplatesApi';
import { TemplatesTable } from '../components/TemplatesTable';
import type { LabelTemplate, LabelTemplateInput } from '../models/labelTemplate';

const TemplateDialog = lazy(() => import('../components/TemplateDialog').then((module) => ({ default: module.TemplateDialog })));

type LabelTemplatesPageProps = { operator: User; onChangeOperator: () => void };

export function LabelTemplatesPage({ operator, onChangeOperator }: LabelTemplatesPageProps) {
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<LabelTemplate | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const templatesQuery = useQuery({
    queryKey: ['label-templates', { activeOnly, search: debouncedSearch }],
    queryFn: () => labelTemplatesApi.list({ activeOnly, search: debouncedSearch }),
  });

  const saveMutation = useMutation({
    mutationFn: async (value: LabelTemplate | LabelTemplateInput): Promise<void> => {
      if ('labelTemplateUid' in value) {
        await labelTemplatesApi.update(value);
      } else {
        await labelTemplatesApi.create(value);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['label-templates'] });
      enqueueSnackbar(editedTemplate ? 'Le modèle a été mis à jour.' : 'Le modèle a été créé.', { variant: 'success' });
      setDialogOpen(false);
      setEditedTemplate(null);
    },
  });

  const openCreate = () => { saveMutation.reset(); setEditedTemplate(null); setDialogOpen(true); };
  const openEdit = (template: LabelTemplate) => { saveMutation.reset(); setEditedTemplate(template); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditedTemplate(null); saveMutation.reset(); };
  const operatorName = `${operator.firstName} ${operator.lastName}`.trim();
  const count = templatesQuery.data?.length ?? 0;

  return (
    <AppShell operatorName={operatorName} onChangeOperator={onChangeOperator}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={3}>
        <Box><Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 850, letterSpacing: '.09em', textTransform: 'uppercase' }}>Modèles d’étiquettes</Typography><Typography component="h1" variant="h1" sx={{ mt: .75 }}>Gestion modèles étiquettes</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>Retrouvez les modèles utilisés en production, contrôlez leur validité et maintenez leurs associations produit.</Typography></Box>
        <Stack direction="row" spacing={1.5} alignItems="center"><Chip label={`${count} modèle${count > 1 ? 's' : ''}`} sx={{ bgcolor: '#E8EDFF', color: 'primary.dark', fontWeight: 800 }} /><Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>Nouveau modèle</Button></Stack>
      </Stack>

      <Paper variant="outlined" sx={{ mt: 3.5, mb: 2.5, p: 2, boxShadow: '0 8px 26px rgba(23,32,51,.04)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) auto auto' }, gap: 1.5, alignItems: 'center' }}>
          <TextField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Produit, type, fichier…" aria-label="Rechercher un modèle" slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> } }} />
          <FormControlLabel control={<Switch checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />} label="Actifs uniquement" sx={{ m: 0, px: 1, minHeight: 48 }} />
          <Tooltip title="Actualiser"><IconButton aria-label="Actualiser les modèles" onClick={() => templatesQuery.refetch()} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}><RefreshRoundedIcon /></IconButton></Tooltip>
        </Box>
      </Paper>

      {templatesQuery.isPending && <FeedbackPanel kind="loading" />}
      {templatesQuery.isError && <FeedbackPanel kind="error" message={getApiErrorMessage(templatesQuery.error, 'Les modèles ne peuvent pas être chargés.')} onRetry={() => templatesQuery.refetch()} />}
      {templatesQuery.isSuccess && templatesQuery.data.length === 0 && <FeedbackPanel kind="empty" message={search ? `Aucun modèle ne correspond à « ${search} ».` : 'Aucun modèle ne correspond à ce filtre.'} />}
      {templatesQuery.isSuccess && templatesQuery.data.length > 0 && <TemplatesTable templates={templatesQuery.data} onEdit={openEdit} />}

      <Suspense fallback={null}>
        <TemplateDialog key={dialogOpen ? editedTemplate?.labelTemplateUid ?? 'create' : 'closed'} open={dialogOpen} template={editedTemplate} operatorUid={operator.userUid} saving={saveMutation.isPending} mutationError={saveMutation.error} onClose={closeDialog} onSubmit={(value) => saveMutation.mutate(value)} />
      </Suspense>
    </AppShell>
  );
}
