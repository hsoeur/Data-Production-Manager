import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { Chip } from '@mui/material';
import { isTemplateActive } from '../utils/dates';

export function TemplateStatus({ endDate }: { endDate: string }) {
  const active = isTemplateActive(endDate);
  return <Chip size="small" color={active ? 'success' : 'default'} variant="outlined" icon={active ? <CheckCircleRoundedIcon /> : <HistoryRoundedIcon />} label={active ? 'Actif' : 'Expiré'} sx={{ fontWeight: 700 }} />;
}
