import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import type { SolderingProgram } from '../models/solderingProgram';
import { formatProductionDate, isSolderingProgramActive } from '../utils/dates';
import { ProgramStatus } from './ProgramStatus';

type SolderingProgramsTableProps = {
  programs: SolderingProgram[];
  onEdit: (program: SolderingProgram) => void;
};

export function SolderingProgramsTable({ programs, onEdit }: SolderingProgramsTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(programs.length / rowsPerPage) - 1));
  const displayed = programs.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', boxShadow: '0 10px 30px rgba(23,32,51,.05)' }}>
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table aria-label="Programmes de soudure">
          <TableHead><TableRow><TableCell>Produit</TableCell><TableCell>Programme</TableCell><TableCell>Face</TableCell><TableCell>Début de validité</TableCell><TableCell>Fin de validité</TableCell><TableCell>Opérateur</TableCell><TableCell>État</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
          <TableBody>
            {displayed.map((program) => {
              const active = isSolderingProgramActive(program.endDate);
              return <TableRow key={program.solderingProgramUid} hover>
                <TableCell><Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{program.productUid}</Typography></TableCell>
                <TableCell><Typography sx={{ fontWeight: 750, fontVariantNumeric: 'tabular-nums' }}>{program.program}</Typography></TableCell>
                <TableCell><Chip size="small" label={program.side} sx={{ bgcolor: '#EEF1FF', color: 'primary.dark', fontWeight: 800 }} /></TableCell>
                <TableCell><Typography variant="body2">{formatProductionDate(program.startDate)}</Typography></TableCell>
                <TableCell><Typography variant="body2">{formatProductionDate(program.endDate)}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ maxWidth: 210, overflowWrap: 'anywhere' }}>{program.userUid}</Typography></TableCell>
                <TableCell><ProgramStatus endDate={program.endDate} /></TableCell>
                <TableCell align="right">{active ? <Tooltip title="Modifier le numéro de programme"><IconButton color="primary" aria-label={`Modifier ${program.productUid}`} onClick={() => onEdit(program)}><EditOutlinedIcon /></IconButton></Tooltip> : <Typography variant="caption" color="text.secondary">Lecture seule</Typography>}</TableCell>
              </TableRow>;
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack sx={{ display: { xs: 'flex', md: 'none' } }} divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
        {displayed.map((program) => {
          const active = isSolderingProgramActive(program.endDate);
          return <Box key={program.solderingProgramUid} component="article" sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}><Box><Typography sx={{ color: 'primary.dark', fontWeight: 800, overflowWrap: 'anywhere' }}>{program.productUid}</Typography><Typography variant="body2" color="text.secondary">Programme {program.program} · Face {program.side}</Typography></Box><ProgramStatus endDate={program.endDate} /></Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, my: 2, py: 2, borderBlock: '1px solid', borderColor: 'divider' }}><Box><Typography variant="caption" color="text.secondary">Début</Typography><Typography variant="body2">{formatProductionDate(program.startDate)}</Typography></Box><Box><Typography variant="caption" color="text.secondary">Fin</Typography><Typography variant="body2">{formatProductionDate(program.endDate)}</Typography></Box><Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="text.secondary">Opérateur</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{program.userUid}</Typography></Box></Box>
            {active ? <Button variant="outlined" fullWidth startIcon={<EditOutlinedIcon />} onClick={() => onEdit(program)}>Modifier</Button> : <Typography variant="body2" color="text.secondary" textAlign="center">Programme expiré en lecture seule</Typography>}
          </Box>;
        })}
      </Stack>

      <TablePagination component="div" count={programs.length} page={currentPage} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[12, 24, 50, 100]} labelRowsPerPage="Lignes par page" labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`} />
    </Paper>
  );
}
