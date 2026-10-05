import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Box, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { useState } from 'react';
import type { DatabaseNotification } from '../models/databaseNotification';
import { formatNotificationDate } from '../utils/format';
import { NotificationStatus } from './NotificationStatus';

type NotificationsTableProps = {
  notifications: DatabaseNotification[];
  processingIds: ReadonlySet<string>;
  onProcess: (notification: DatabaseNotification) => void;
};

export function NotificationsTable({ notifications, processingIds, onProcess }: NotificationsTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(notifications.length / rowsPerPage) - 1));
  const displayed = notifications.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  return <Paper variant="outlined" sx={{ overflow: 'hidden', boxShadow: '0 10px 30px rgba(23,32,51,.05)' }}>
    <TableContainer sx={{ display: { xs: 'none', lg: 'block' } }}>
      <Table aria-label="Notifications des ordres de fabrication">
        <TableHead><TableRow><TableCell>Élément</TableCell><TableCell>Identifiant</TableCell><TableCell>Propriété</TableCell><TableCell>Avant</TableCell><TableCell>Après</TableCell><TableCell>Modification</TableCell><TableCell>Opérateur</TableCell><TableCell>Statut</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
        <TableBody>{displayed.map((notification) => <TableRow key={notification.databaseNotificationUid} hover>
          <TableCell sx={{ fontWeight: 650 }}>{notification.entityType}</TableCell>
          <TableCell><Typography sx={{ color: 'primary.dark', fontWeight: 800, overflowWrap: 'anywhere' }}>{notification.entityUId}</Typography></TableCell>
          <TableCell>{notification.propertyName}</TableCell>
          <TableCell><Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', overflowWrap: 'anywhere' }}>{notification.oldValue || '—'}</Typography></TableCell>
          <TableCell><Typography variant="body2" sx={{ color: 'success.main', fontWeight: 750, overflowWrap: 'anywhere' }}>{notification.newValue || '—'}</Typography></TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatNotificationDate(notification.modifiedAt)}</TableCell>
          <TableCell sx={{ maxWidth: 180, overflowWrap: 'anywhere' }}>{notification.modifiedBy}</TableCell>
          <TableCell><NotificationStatus status={notification.processed} /></TableCell>
          <TableCell align="right"><NotificationAction notification={notification} processing={processingIds.has(notification.databaseNotificationUid)} onProcess={onProcess} /></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </TableContainer>

    <Stack sx={{ display: { xs: 'flex', lg: 'none' } }} divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
      {displayed.map((notification) => <Box key={notification.databaseNotificationUid} component="article" sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}><Box sx={{ minWidth: 0 }}><Typography variant="body2" color="text.secondary">{notification.entityType}</Typography><Typography sx={{ color: 'primary.dark', fontWeight: 800, overflowWrap: 'anywhere' }}>{notification.entityUId}</Typography></Box><NotificationStatus status={notification.processed} /></Stack>
        <Typography sx={{ mt: 2, fontWeight: 750 }}>{notification.propertyName}</Typography>
        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 1 }}><Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', overflowWrap: 'anywhere' }}>{notification.oldValue || '—'}</Typography><Typography aria-hidden color="text.secondary">→</Typography><Typography variant="body2" sx={{ color: 'success.main', fontWeight: 750, overflowWrap: 'anywhere' }}>{notification.newValue || '—'}</Typography></Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>{formatNotificationDate(notification.modifiedAt)} · {notification.modifiedBy}</Typography>
        <Box sx={{ mt: 2, '& .MuiButton-root': { width: '100%' } }}><NotificationAction notification={notification} processing={processingIds.has(notification.databaseNotificationUid)} onProcess={onProcess} /></Box>
      </Box>)}
    </Stack>

    <TablePagination component="div" count={notifications.length} page={currentPage} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[12, 25, 50, 100]} labelRowsPerPage="Lignes par page" labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`} />
  </Paper>;
}

function NotificationAction({ notification, processing, onProcess }: { notification: DatabaseNotification; processing: boolean; onProcess: (notification: DatabaseNotification) => void }) {
  if (notification.processed === 'PROCESSED') return <Typography variant="body2" color="text.secondary">Aucune action</Typography>;
  return <Button variant="outlined" disabled={processing} onClick={() => onProcess(notification)} startIcon={processing ? <CircularProgress size={17} /> : <CheckCircleOutlineRoundedIcon />} sx={{ whiteSpace: 'nowrap' }}>{processing ? 'Traitement…' : 'Marquer comme traitée'}</Button>;
}
