import { Chip } from '@mui/material';
import { isSolderingProgramActive } from '../utils/dates';

export function ProgramStatus({ endDate }: { endDate: string }) {
  const active = isSolderingProgramActive(endDate);
  return <Chip size="small" label={active ? 'Actif' : 'Expiré'} sx={{ bgcolor: active ? '#E8F5EE' : '#F1F3F6', color: active ? '#12623D' : '#667085', fontWeight: 800 }} />;
}
