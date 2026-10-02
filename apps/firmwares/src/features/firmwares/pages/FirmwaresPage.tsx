import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Chip, FormControlLabel, IconButton, InputAdornment, Paper, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { useSnackbar } from 'notistack';
import { getApiErrorMessage } from '@pdm/shared/api';
import { useDebouncedValue } from '@pdm/shared/hooks';
import type { User } from '@pdm/shared/operators';
import { AppShell, FeedbackPanel } from '@pdm/shared/ui';
import { firmwaresApi } from '../api/firmwaresApi';
import { FirmwaresTable } from '../components/FirmwaresTable';
import type { Firmware } from '../models/firmware';

const FirmwareDialog = lazy(() => import('../components/FirmwareDialog').then((module) => ({ default: module.FirmwareDialog })));
const LinkFirmwareFileDialog = lazy(() => import('../components/LinkFirmwareFileDialog').then((module) => ({ default: module.LinkFirmwareFileDialog })));
const FirmwareStatusDialog = lazy(() => import('../components/FirmwareStatusDialog').then((module) => ({ default: module.FirmwareStatusDialog })));

type FirmwaresPageProps = { operator: User; onChangeOperator: () => void };

export function FirmwaresPage({ operator, onChangeOperator }: FirmwaresPageProps) {
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [editedFirmware, setEditedFirmware] = useState<Firmware | null>(null);
  const [linkedFirmware, setLinkedFirmware] = useState<Firmware | null>(null);
  const [statusFirmware, setStatusFirmware] = useState<Firmware | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const firmwaresQuery = useQuery({
    queryKey: ['firmwares', { activeOnly, keyword: debouncedSearch }],
    queryFn: () => firmwaresApi.list(activeOnly, debouncedSearch),
  });

  const refresh = async () => queryClient.invalidateQueries({ queryKey: ['firmwares'] });
  const updateMutation = useMutation({
    mutationFn: firmwaresApi.update,
    onSuccess: async () => { await refresh(); enqueueSnackbar('La nouvelle version a été enregistrée.', { variant: 'success' }); setEditedFirmware(null); },
  });
  const linkMutation = useMutation({
    mutationFn: ({ firmware, file }: { firmware: Firmware; file: string }) => firmwaresApi.linkFile(firmware, file),
    onSuccess: async () => { await refresh(); enqueueSnackbar('Le fichier firmware a été lié.', { variant: 'success' }); setLinkedFirmware(null); },
  });
  const statusMutation = useMutation({
    mutationFn: (firmware: Firmware) => firmwaresApi.setSuspended(firmware, !firmware.isSuspended),
    onSuccess: async (_, firmware) => { await refresh(); enqueueSnackbar(firmware.isSuspended ? 'Le firmware a été réactivé.' : 'Le firmware a été suspendu.', { variant: 'success' }); setStatusFirmware(null); },
    onError: (error) => enqueueSnackbar(getApiErrorMessage(error, 'Le statut du firmware n’a pas pu être modifié.'), { variant: 'error' }),
  });

  const operatorName = `${operator.firstName} ${operator.lastName}`.trim();
  const count = firmwaresQuery.data?.length ?? 0;

  return <AppShell managerName="Firmwares" operatorName={operatorName} onChangeOperator={onChangeOperator}>
    <Box><Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 850, letterSpacing: '.09em', textTransform: 'uppercase' }}>Logiciels embarqués</Typography><Typography component="h1" variant="h1" sx={{ mt: .75 }}>Gestion des firmwares</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>Consultez les versions disponibles, planifiez leur évolution et maîtrisez leur mise à disposition en production.</Typography></Box>

    <Paper variant="outlined" sx={{ mt: 3.5, mb: 2.5, p: 2, boxShadow: '0 8px 26px rgba(23,32,51,.04)' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) auto auto auto' }, gap: 1.5, alignItems: 'center' }}>
        <TextField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Produit ou usage…" aria-label="Rechercher un firmware" slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> } }} />
        <FormControlLabel control={<Switch checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />} label="Actifs uniquement" sx={{ m: 0, px: 1, minHeight: 48 }} />
        <Chip label={`${count} firmware${count > 1 ? 's' : ''}`} sx={{ bgcolor: '#E8EDFF', color: 'primary.dark', fontWeight: 800 }} />
        <Tooltip title="Actualiser"><IconButton aria-label="Actualiser les firmwares" onClick={() => firmwaresQuery.refetch()} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}><RefreshRoundedIcon /></IconButton></Tooltip>
      </Box>
    </Paper>

    {firmwaresQuery.isPending && <FeedbackPanel kind="loading" />}
    {firmwaresQuery.isError && <FeedbackPanel kind="error" message={getApiErrorMessage(firmwaresQuery.error, 'Les firmwares ne peuvent pas être chargés.')} onRetry={() => firmwaresQuery.refetch()} />}
    {firmwaresQuery.isSuccess && count === 0 && <FeedbackPanel kind="empty" message={search ? `Aucun firmware ne correspond à « ${search} ».` : 'Aucun firmware ne correspond à ce filtre.'} />}
    {firmwaresQuery.isSuccess && count > 0 && <FirmwaresTable firmwares={firmwaresQuery.data} onEdit={(firmware) => { updateMutation.reset(); setEditedFirmware(firmware); }} onLinkFile={(firmware) => { linkMutation.reset(); setLinkedFirmware(firmware); }} onToggleSuspended={(firmware) => { statusMutation.reset(); setStatusFirmware(firmware); }} />}

    <Suspense fallback={null}>
      <FirmwareDialog key={editedFirmware?.firmwareUid ?? 'closed-edit'} open={Boolean(editedFirmware)} firmware={editedFirmware} operatorUid={operator.userUid} saving={updateMutation.isPending} mutationError={updateMutation.error} onClose={() => setEditedFirmware(null)} onSubmit={(firmware) => updateMutation.mutate(firmware)} />
      <LinkFirmwareFileDialog key={linkedFirmware?.firmwareUid ?? 'closed-link'} open={Boolean(linkedFirmware)} firmware={linkedFirmware} saving={linkMutation.isPending} mutationError={linkMutation.error} onClose={() => setLinkedFirmware(null)} onSubmit={(file) => linkedFirmware && linkMutation.mutate({ firmware: linkedFirmware, file })} />
      <FirmwareStatusDialog firmware={statusFirmware} saving={statusMutation.isPending} onClose={() => setStatusFirmware(null)} onConfirm={() => statusFirmware && statusMutation.mutate(statusFirmware)} />
    </Suspense>
  </AppShell>;
}
