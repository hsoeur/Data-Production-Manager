import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Button, Chip, FormControlLabel, IconButton, InputAdornment, Paper, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { getApiErrorMessage } from '@pdm/shared/api';
import type { User } from '@pdm/shared/operators';
import { AppShell, FeedbackPanel } from '@pdm/shared/ui';
import { tolerancesApi } from '../api/tolerancesApi';
import { TolerancesTable } from '../components/TolerancesTable';
import type { CopyToleranceBatchRequest, Tolerance, ToleranceInput } from '../models/tolerance';

const ToleranceDialog = lazy(() => import('../components/ToleranceDialog').then((module) => ({ default: module.ToleranceDialog })));
const BatchCopyDialog = lazy(() => import('../components/BatchCopyDialog').then((module) => ({ default: module.BatchCopyDialog })));

type TolerancesPageProps = { operator: User; onChangeOperator: () => void };

export function TolerancesPage({ operator, onChangeOperator }: TolerancesPageProps) {
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editedTolerance, setEditedTolerance] = useState<Tolerance | null>(null);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const tolerancesQuery = useQuery({ queryKey: ['tolerances', { activeOnly }], queryFn: () => tolerancesApi.list(activeOnly) });
  const machinesQuery = useQuery({ queryKey: ['machines'], queryFn: tolerancesApi.getMachines });

  const visibleTolerances = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('fr');
    if (!needle) return tolerancesQuery.data ?? [];
    return (tolerancesQuery.data ?? []).filter((item) => [item.productUid, item.label, item.machineUid, item.mode, item.unitUid, String(item.operationNumber)].some((value) => value.toLocaleLowerCase('fr').includes(needle)));
  }, [search, tolerancesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (value: Tolerance | ToleranceInput): Promise<void> => {
      if ('toleranceUid' in value) await tolerancesApi.update(value);
      else await tolerancesApi.create(value);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tolerances'] });
      enqueueSnackbar(editedTolerance ? 'La tolérance a été mise à jour.' : 'La tolérance a été créée.', { variant: 'success' });
      setDialogOpen(false);
      setEditedTolerance(null);
    },
  });

  const copyMutation = useMutation({
    mutationFn: (value: CopyToleranceBatchRequest) => tolerancesApi.copyBatch(value),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['tolerances'] });
      enqueueSnackbar(`${result.createdCount} tolérance${result.createdCount > 1 ? 's ont' : ' a'} été créée${result.createdCount > 1 ? 's' : ''} pour ${result.targetProductUid}.`, { variant: 'success' });
      setBatchOpen(false);
    },
  });

  const openCreate = () => { saveMutation.reset(); setEditedTolerance(null); setDialogOpen(true); };
  const openEdit = (tolerance: Tolerance) => { saveMutation.reset(); setEditedTolerance(tolerance); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditedTolerance(null); saveMutation.reset(); };
  const openBatch = () => { copyMutation.reset(); setBatchOpen(true); };
  const operatorName = `${operator.firstName} ${operator.lastName}`.trim();

  return <AppShell managerName="Tolérances" operatorName={operatorName} onChangeOperator={onChangeOperator}>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={3}>
      <Box><Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 850, letterSpacing: '.09em', textTransform: 'uppercase' }}>Tolérances de production</Typography><Typography component="h1" variant="h1" sx={{ mt: .75 }}>Gestion des tolérances</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>Définissez et maintenez les critères de contrôle appliqués aux produits, opérations et machines.</Typography></Box>
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5}><Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={openBatch}>Dupliquer un lot</Button><Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>Nouvelle tolérance</Button></Stack>
    </Stack>

    <Paper variant="outlined" sx={{ mt: 3.5, mb: 2.5, p: 2, boxShadow: '0 8px 26px rgba(23,32,51,.04)' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) auto auto auto' }, gap: 1.5, alignItems: 'center' }}>
        <TextField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Produit, machine, caractéristique…" aria-label="Rechercher une tolérance" slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> } }} />
        <FormControlLabel control={<Switch checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />} label="Actives uniquement" sx={{ m: 0, px: 1, minHeight: 48 }} />
        <Chip label={`${visibleTolerances.length} tolérance${visibleTolerances.length > 1 ? 's' : ''}`} sx={{ bgcolor: '#E8EDFF', color: 'primary.dark', fontWeight: 800 }} />
        <Tooltip title="Actualiser"><IconButton aria-label="Actualiser les tolérances" onClick={() => tolerancesQuery.refetch()} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}><RefreshRoundedIcon /></IconButton></Tooltip>
      </Box>
    </Paper>

    {tolerancesQuery.isPending && <FeedbackPanel kind="loading" />}
    {tolerancesQuery.isError && <FeedbackPanel kind="error" message={getApiErrorMessage(tolerancesQuery.error, 'Les tolérances ne peuvent pas être chargées.')} onRetry={() => tolerancesQuery.refetch()} />}
    {tolerancesQuery.isSuccess && visibleTolerances.length === 0 && <FeedbackPanel kind="empty" message={search ? `Aucune tolérance ne correspond à « ${search} ».` : 'Aucune tolérance ne correspond à ce filtre.'} />}
    {tolerancesQuery.isSuccess && visibleTolerances.length > 0 && <TolerancesTable tolerances={visibleTolerances} machines={machinesQuery.data ?? []} onEdit={openEdit} />}

    <Suspense fallback={null}>
      <ToleranceDialog key={dialogOpen ? editedTolerance?.toleranceUid ?? 'create' : 'closed'} open={dialogOpen} tolerance={editedTolerance} operatorUid={operator.userUid} saving={saveMutation.isPending} mutationError={saveMutation.error} onClose={closeDialog} onSubmit={(value) => saveMutation.mutate(value)} />
      <BatchCopyDialog key={batchOpen ? 'batch-open' : 'batch-closed'} open={batchOpen} operatorUid={operator.userUid} saving={copyMutation.isPending} mutationError={copyMutation.error} onClose={() => setBatchOpen(false)} onSubmit={(value) => copyMutation.mutate(value)} />
    </Suspense>
  </AppShell>;
}
