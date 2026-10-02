import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import type { Firmware } from '../models/firmware';
import { formatDate } from '../utils/dates';
import { FirmwareStatus } from './FirmwareStatus';

type FirmwaresTableProps = {
  firmwares: Firmware[];
  onEdit: (firmware: Firmware) => void;
  onLinkFile: (firmware: Firmware) => void;
  onToggleSuspended: (firmware: Firmware) => void;
};

export function FirmwaresTable({ firmwares, onEdit, onLinkFile, onToggleSuspended }: FirmwaresTableProps) {
  return <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: '0 8px 26px rgba(23,32,51,.04)' }}>
    <Table sx={{ minWidth: 960 }}>
      <TableHead><TableRow>
        <TableCell>Produit</TableCell><TableCell>Usage</TableCell><TableCell>Version</TableCell><TableCell>Fichier</TableCell><TableCell>Validité</TableCell><TableCell>Statut</TableCell><TableCell align="right">Actions</TableCell>
      </TableRow></TableHead>
      <TableBody>{firmwares.map((firmware) => <TableRow hover key={firmware.firmwareUid}>
        <TableCell><Typography variant="body2" sx={{ fontWeight: 800 }}>{firmware.product}</Typography></TableCell>
        <TableCell>{firmware.label}</TableCell>
        <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{firmware.version || '—'}</Typography></TableCell>
        <TableCell sx={{ maxWidth: 280 }}><Typography variant="body2" noWrap title={firmware.file}>{firmware.file || 'Non lié'}</Typography></TableCell>
        <TableCell>{formatDate(firmware.startDate)}{new Date(firmware.endDate).getUTCFullYear() < 9999 ? ` → ${formatDate(firmware.endDate)}` : ''}</TableCell>
        <TableCell><FirmwareStatus firmware={firmware} /></TableCell>
        <TableCell align="right"><Stack direction="row" justifyContent="flex-end" spacing={.25}>
          {new Date(firmware.endDate).getUTCFullYear() === 9999 && <>
            <Tooltip title="Préparer une nouvelle version"><IconButton aria-label={`Modifier ${firmware.product} ${firmware.label}`} onClick={() => onEdit(firmware)}><EditOutlinedIcon /></IconButton></Tooltip>
            <Tooltip title="Lier un fichier"><IconButton aria-label={`Lier un fichier à ${firmware.product} ${firmware.label}`} onClick={() => onLinkFile(firmware)}><LinkRoundedIcon /></IconButton></Tooltip>
            <Tooltip title={firmware.isSuspended ? 'Réactiver' : 'Suspendre'}><IconButton color={firmware.isSuspended ? 'success' : 'default'} aria-label={`${firmware.isSuspended ? 'Réactiver' : 'Suspendre'} ${firmware.product} ${firmware.label}`} onClick={() => onToggleSuspended(firmware)}>{firmware.isSuspended ? <PlayCircleOutlineRoundedIcon /> : <PauseCircleOutlineRoundedIcon />}</IconButton></Tooltip>
          </>}
        </Stack></TableCell>
      </TableRow>)}</TableBody>
    </Table>
  </TableContainer>;
}
