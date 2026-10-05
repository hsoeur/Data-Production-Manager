import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Button, Chip, FormControlLabel, IconButton, InputAdornment, Paper, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { useSnackbar } from 'notistack';
import { getApiErrorMessage } from '@pdm/shared/api';
import { useDebouncedValue } from '@pdm/shared/hooks';
import type { User } from '@pdm/shared/operators';
import { AppShell } from '@pdm/shared/ui';
import { solderingProgramsApi } from '../api/solderingProgramsApi';
import { SolderingProgramsTable } from '../components/SolderingProgramsTable';
import { SolderingProgramsFeedback } from '../components/SolderingProgramsFeedback';
import type { SolderingProgram, SolderingProgramCreateInput } from '../models/solderingProgram';

const SolderingProgramDialog = lazy(() => import('../components/SolderingProgramDialog').then((module) => ({ default: module.SolderingProgramDialog })));

type SolderingProgramsPageProps = { operator: User; onChangeOperator: () => void };

export function SolderingProgramsPage({ operator, onChangeOperator }: SolderingProgramsPageProps) {
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedProgram, setEditedProgram] = useState<SolderingProgram | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const programsQuery = useQuery({
    queryKey: ['soldering-programs', { activeOnly, search: debouncedSearch }],
    queryFn: () => solderingProgramsApi.list({ activeOnly, search: debouncedSearch }),
  });

  const saveMutation = useMutation({
    mutationFn: async (value: SolderingProgram | SolderingProgramCreateInput): Promise<void> => {
      if ('solderingProgramUid' in value) await solderingProgramsApi.update(value);
      else await solderingProgramsApi.create(value);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['soldering-programs'] });
      enqueueSnackbar(editedProgram ? 'Le programme a été mis à jour.' : 'Le programme a été créé.', { variant: 'success' });
      setDialogOpen(false);
      setEditedProgram(null);
    },
  });

  const openCreate = () => { saveMutation.reset(); setEditedProgram(null); setDialogOpen(true); };
  const openEdit = (program: SolderingProgram) => { saveMutation.reset(); setEditedProgram(program); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditedProgram(null); saveMutation.reset(); };
  const operatorName = `${operator.firstName} ${operator.lastName}`.trim();
  const count = programsQuery.data?.length ?? 0;

  return <AppShell managerName="Programmes de soudure" operatorName={operatorName} onChangeOperator={onChangeOperator}>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={3}>
      <Box><Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 850, letterSpacing: '.09em', textTransform: 'uppercase' }}>Programmes de soudure</Typography><Typography component="h1" variant="h1" sx={{ mt: .75 }}>Gestion des programmes de soudure</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>Retrouvez les programmes utilisés en production, contrôlez leur validité et maintenez leur association avec les produits.</Typography></Box>
      <Stack direction="row" spacing={1.5} alignItems="center"><Chip label={`${count} programme${count > 1 ? 's' : ''}`} sx={{ bgcolor: '#E8EDFF', color: 'primary.dark', fontWeight: 800 }} /><Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>Nouveau programme</Button></Stack>
    </Stack>

    <Paper variant="outlined" sx={{ mt: 3.5, mb: 2.5, p: 2, boxShadow: '0 8px 26px rgba(23,32,51,.04)' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) auto auto' }, gap: 1.5, alignItems: 'center' }}>
        <TextField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Produit, programme ou opérateur…" aria-label="Rechercher un programme" slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> } }} />
        <FormControlLabel control={<Switch checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />} label="Actifs uniquement" sx={{ m: 0, px: 1, minHeight: 48 }} />
        <Tooltip title="Actualiser"><IconButton aria-label="Actualiser les programmes" onClick={() => programsQuery.refetch()} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}><RefreshRoundedIcon /></IconButton></Tooltip>
      </Box>
    </Paper>

    {programsQuery.isPending && <SolderingProgramsFeedback kind="loading" />}
    {programsQuery.isError && <SolderingProgramsFeedback kind="error" message={getApiErrorMessage(programsQuery.error, 'Les programmes ne peuvent pas être chargés.')} onRetry={() => programsQuery.refetch()} />}
    {programsQuery.isSuccess && count === 0 && <SolderingProgramsFeedback kind="empty" message={search ? `Aucun programme ne correspond à « ${search} ».` : 'Aucun programme ne correspond à ce filtre.'} />}
    {programsQuery.isSuccess && count > 0 && <SolderingProgramsTable programs={programsQuery.data} onEdit={openEdit} />}

    <Suspense fallback={null}>
      <SolderingProgramDialog key={dialogOpen ? editedProgram?.solderingProgramUid ?? 'create' : 'closed'} open={dialogOpen} program={editedProgram} operatorUid={operator.userUid} saving={saveMutation.isPending} mutationError={saveMutation.error} onClose={closeDialog} onSubmit={(value) => saveMutation.mutate(value)} />
    </Suspense>
  </AppShell>;
}
