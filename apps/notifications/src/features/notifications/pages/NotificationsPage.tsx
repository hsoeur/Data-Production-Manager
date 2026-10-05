import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, type ReactNode } from 'react';
import { useSnackbar } from 'notistack';
import { getApiErrorMessage } from '@pdm/shared/api';
import type { User } from '@pdm/shared/operators';
import { AppShell } from '@pdm/shared/ui';
import { notificationsApi } from '../api/notificationsApi';
import { NotificationsFeedback } from '../components/NotificationsFeedback';
import { NotificationsTable } from '../components/NotificationsTable';
import type { DatabaseNotification } from '../models/databaseNotification';

type NotificationsPageProps = { operator: User; onChangeOperator: () => void };

export function NotificationsPage({ operator, onChangeOperator }: NotificationsPageProps) {
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(() => new Set());
  const parserHasRun = useRef(false);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const notificationsQuery = useQuery({
    queryKey: ['database-notifications', { search: activeSearch }],
    queryFn: async () => {
      if (!parserHasRun.current) {
        await notificationsApi.runParser();
        parserHasRun.current = true;
      }
      return activeSearch ? notificationsApi.search(activeSearch) : notificationsApi.list();
    },
  });

  const processMutation = useMutation({
    mutationFn: (notification: DatabaseNotification) => notificationsApi.process(notification.databaseNotificationUid, operator.userUid),
    onMutate: (notification) => setProcessingIds((current) => new Set(current).add(notification.databaseNotificationUid)),
    onSuccess: async () => {
      setSearch('');
      setActiveSearch('');
      await queryClient.invalidateQueries({ queryKey: ['database-notifications'] });
      enqueueSnackbar('La notification est maintenant marquée comme traitée.', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(getApiErrorMessage(error, 'La notification n’a pas pu être traitée.'), { variant: 'error' }),
    onSettled: (_, __, notification) => setProcessingIds((current) => {
      const next = new Set(current);
      next.delete(notification.databaseNotificationUid);
      return next;
    }),
  });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = search.trim();
    if (keyword === activeSearch) void notificationsQuery.refetch();
    else setActiveSearch(keyword);
  };

  const showAll = () => {
    setSearch('');
    if (activeSearch) setActiveSearch('');
    else void notificationsQuery.refetch();
  };

  const notifications = notificationsQuery.data ?? [];
  const pendingCount = notifications.filter((notification) => notification.processed !== 'PROCESSED').length;
  const processedCount = notifications.length - pendingCount;
  const operatorName = `${operator.firstName} ${operator.lastName}`.trim();

  return <AppShell managerName="Notifications de production" operatorName={operatorName} onChangeOperator={onChangeOperator}>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={3}>
      <Box><Typography sx={{ color: 'primary.main', fontSize: 12, fontWeight: 850, letterSpacing: '.09em', textTransform: 'uppercase' }}>Ordres de fabrication</Typography><Typography component="h1" variant="h1" sx={{ mt: .75 }}>Notifications de désynchronisation</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 780 }}>Consultez les changements détectés sur les ordres de fabrication et confirmez leur prise en compte dans la base de production.</Typography></Box>
      <Tooltip title="Actualiser la liste"><span><IconButton aria-label="Actualiser les notifications" onClick={showAll} disabled={notificationsQuery.isFetching} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}><RefreshRoundedIcon /></IconButton></span></Tooltip>
    </Stack>

    <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, minmax(190px, 240px))' }, gap: 1.5 }}>
      <MetricCard icon={<PendingActionsRoundedIcon />} label="À traiter" value={pendingCount} tone="warning" />
      <MetricCard icon={<TaskAltRoundedIcon />} label="Traitées" value={processedCount} tone="success" />
    </Box>

    <Paper component="form" onSubmit={submitSearch} variant="outlined" sx={{ mt: 3, mb: 2.5, p: 2, boxShadow: '0 8px 26px rgba(23,32,51,.04)' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(280px, 1fr) auto' }, gap: 1.5, alignItems: 'center' }}>
        <TextField value={search} onChange={(event) => setSearch(event.target.value)} label="Rechercher une notification" placeholder="Identifiant, propriété, valeur…" autoFocus slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton aria-label="Effacer la recherche" onClick={showAll} disabled={notificationsQuery.isFetching}><ClearRoundedIcon /></IconButton></InputAdornment> : undefined } }} />
        <Button type="submit" variant="contained" disabled={notificationsQuery.isFetching} startIcon={<SearchRoundedIcon />}>{notificationsQuery.isFetching ? 'Recherche…' : 'Rechercher'}</Button>
      </Box>
      {activeSearch && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Résultats pour <Box component="span" sx={{ color: 'text.primary', fontWeight: 750 }}>« {activeSearch} »</Box> · {notifications.length} résultat{notifications.length !== 1 ? 's' : ''}</Typography>}
    </Paper>

    {notificationsQuery.isPending && <NotificationsFeedback kind="loading" />}
    {notificationsQuery.isError && <NotificationsFeedback kind="error" message={getApiErrorMessage(notificationsQuery.error, 'Vérifiez la connexion aux services Data et Parser, puis réessayez.')} onRetry={() => notificationsQuery.refetch()} />}
    {notificationsQuery.isSuccess && notifications.length === 0 && <NotificationsFeedback kind="empty" message={activeSearch ? 'Essayez un autre identifiant, une propriété ou une valeur.' : 'Aucune désynchronisation n’est actuellement signalée.'} />}
    {notificationsQuery.isSuccess && notifications.length > 0 && <NotificationsTable notifications={notifications} processingIds={processingIds} onProcess={(notification) => processMutation.mutate(notification)} />}
  </AppShell>;
}

function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: 'warning' | 'success' }) {
  return <Paper variant="outlined" sx={{ p: 2.25, display: 'flex', alignItems: 'center', gap: 1.5 }}><Box sx={{ width: 42, height: 42, flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: 2.5, color: `${tone}.main`, bgcolor: `${tone}.light` }}>{icon}</Box><Box><Typography sx={{ fontSize: '1.5rem', lineHeight: 1.1, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></Box></Paper>;
}
