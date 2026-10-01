import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import type { LabelTemplate } from '../models/labelTemplate';
import { formatProductionDate, isTemplateActive } from '../utils/dates';
import { TemplateStatus } from './TemplateStatus';

type TemplatesTableProps = { templates: LabelTemplate[]; onEdit: (template: LabelTemplate) => void };

export function TemplatesTable({ templates, onEdit }: TemplatesTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(templates.length / rowsPerPage) - 1));
  const displayed = templates.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', boxShadow: '0 10px 30px rgba(23,32,51,.05)' }}>
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table aria-label="Modèles d’étiquettes">
          <TableHead><TableRow><TableCell>Produit</TableCell><TableCell>Type</TableCell><TableCell>Fichier modèle</TableCell><TableCell>Photo</TableCell><TableCell>Validité</TableCell><TableCell>État</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
          <TableBody>
            {displayed.map((template) => (
              <TableRow key={template.labelTemplateUid} hover>
                <TableCell><Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{template.product}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 650 }}>{template.labelTypeUid}</Typography></TableCell>
                <TableCell><FileValue icon={<DescriptionOutlinedIcon />} value={template.templateFile} /></TableCell>
                <TableCell><FileValue icon={<ImageOutlinedIcon />} value={template.photo} /></TableCell>
                <TableCell><Typography variant="body2">{formatProductionDate(template.startDate)}</Typography><Typography variant="caption" color="text.secondary">au {formatProductionDate(template.endDate)}</Typography></TableCell>
                <TableCell><TemplateStatus endDate={template.endDate} /></TableCell>
                <TableCell align="right"><Tooltip title={isTemplateActive(template.endDate) ? 'Modifier' : 'Modifier ce modèle expiré'}><IconButton color="primary" aria-label={`Modifier ${template.product}`} onClick={() => onEdit(template)}><EditOutlinedIcon /></IconButton></Tooltip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack sx={{ display: { xs: 'flex', md: 'none' } }} divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
        {displayed.map((template) => (
          <Box key={template.labelTemplateUid} sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}><Box><Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{template.product}</Typography><Typography variant="body2" color="text.secondary">{template.labelTypeUid}</Typography></Box><TemplateStatus endDate={template.endDate} /></Stack>
            <Stack spacing={1} sx={{ my: 2 }}><FileValue icon={<DescriptionOutlinedIcon />} value={template.templateFile} /><Typography variant="body2" color="text.secondary">Valide jusqu’au {formatProductionDate(template.endDate)}</Typography></Stack>
            <Button variant="outlined" fullWidth startIcon={<EditOutlinedIcon />} onClick={() => onEdit(template)}>Modifier</Button>
          </Box>
        ))}
      </Stack>

      <TablePagination
        component="div"
        count={templates.length}
        page={currentPage}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
        rowsPerPageOptions={[12, 24, 50, 100]}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
      />
    </Paper>
  );
}

function FileValue({ icon, value }: { icon: ReactNode; value?: string }) {
  return <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, color: value ? 'text.primary' : 'text.secondary' }}><Box sx={{ color: 'text.secondary', display: 'flex', '& svg': { fontSize: 19 } }}>{icon}</Box><Typography variant="body2" title={value} sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || 'Non renseigné'}</Typography></Stack>;
}
