import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import type { Machine, Tolerance } from '../models/tolerance';
import { formatProductionDate, isToleranceActive } from '../utils/dates';
import { ToleranceStatus } from './ToleranceStatus';

type TolerancesTableProps = {
  machines: Machine[];
  tolerances: Tolerance[];
  onEdit: (tolerance: Tolerance) => void;
};

const modeLabels: Record<Tolerance['mode'], string> = {
  Between: 'Compris entre', Equal: 'Égal à', Min: 'Minimum', Max: 'Maximum', Record: 'Enregistrement', Entry: 'Saisie',
};

function criterion(tolerance: Tolerance): string {
  const unit = tolerance.unitUid === 'Char' ? '' : ` ${tolerance.unitUid}`;
  if (tolerance.mode === 'Between') return `${tolerance.val1} — ${tolerance.val2}${unit}`;
  if (tolerance.mode === 'Record' || tolerance.mode === 'Entry') return modeLabels[tolerance.mode];
  if (tolerance.mode === 'Equal' && tolerance.unitUid === 'Char') return `${modeLabels.Equal} "${tolerance.val1}"`;
  return `${modeLabels[tolerance.mode]} ${tolerance.val1}${unit}`;
}

export function TolerancesTable({ machines, tolerances, onEdit }: TolerancesTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(tolerances.length / rowsPerPage) - 1));
  const displayed = tolerances.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);
  const machineLabels = new Map(machines.map((machine) => [machine.machineUid, machine.label]));

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', boxShadow: '0 10px 30px rgba(23,32,51,.05)' }}>
      <TableContainer sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Table aria-label="Tolérances">
          <TableHead><TableRow><TableCell>Produit</TableCell><TableCell>Opération</TableCell><TableCell>Machine</TableCell><TableCell>Caractéristique</TableCell><TableCell>Critère</TableCell><TableCell>Validité</TableCell><TableCell>État</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
          <TableBody>
            {displayed.map((tolerance) => <TableRow key={tolerance.toleranceUid} hover>
              <TableCell><Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{tolerance.productUid}</Typography></TableCell>
              <TableCell>{tolerance.operationNumber}</TableCell>
              <TableCell><Typography variant="body2" sx={{ fontWeight: 650 }}>{machineLabels.get(tolerance.machineUid) ?? tolerance.machineUid}</Typography><Typography variant="caption" color="text.secondary">{tolerance.machineUid}</Typography></TableCell>
              <TableCell>{tolerance.label}</TableCell>
              <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{criterion(tolerance)}</Typography><Typography variant="caption" color="text.secondary">{modeLabels[tolerance.mode]}</Typography></TableCell>
              <TableCell><Typography variant="body2">{formatProductionDate(tolerance.startDate)}</Typography><Typography variant="caption" color="text.secondary">au {formatProductionDate(tolerance.endDate)}</Typography></TableCell>
              <TableCell><ToleranceStatus endDate={tolerance.endDate} /></TableCell>
              <TableCell align="right">{isToleranceActive(tolerance.endDate) ? <Tooltip title="Modifier"><IconButton color="primary" aria-label={`Modifier ${tolerance.label}`} onClick={() => onEdit(tolerance)}><EditOutlinedIcon /></IconButton></Tooltip> : <Typography variant="caption" color="text.secondary">Lecture seule</Typography>}</TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack sx={{ display: { xs: 'flex', lg: 'none' } }} divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
        {displayed.map((tolerance) => <Box key={tolerance.toleranceUid} sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" spacing={2}><Box><Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{tolerance.productUid}</Typography><Typography variant="body2" color="text.secondary">{tolerance.operationNumber} · {machineLabels.get(tolerance.machineUid) ?? tolerance.machineUid}</Typography></Box><ToleranceStatus endDate={tolerance.endDate} /></Stack>
          <Box sx={{ my: 2 }}><Typography sx={{ fontWeight: 750 }}>{tolerance.label}</Typography><Typography variant="body2" color="text.secondary">{criterion(tolerance)}</Typography></Box>
          {isToleranceActive(tolerance.endDate) ? <Button variant="outlined" fullWidth startIcon={<EditOutlinedIcon />} onClick={() => onEdit(tolerance)}>Modifier</Button> : <Typography variant="body2" color="text.secondary" textAlign="center">Tolérance expirée en lecture seule</Typography>}
        </Box>)}
      </Stack>

      <TablePagination component="div" count={tolerances.length} page={currentPage} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[12, 24, 50, 100]} labelRowsPerPage="Lignes par page" labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`} />
    </Paper>
  );
}
