import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { Chip } from '@mui/material';
import { isToleranceActive } from '../utils/dates';

export function ToleranceStatus({ endDate }: { endDate: string }) {
  const active = isToleranceActive(endDate);
  return <Chip size="small" color={active ? 'success' : 'default'} variant="outlined" icon={active ? <CheckCircleRoundedIcon /> : <HistoryRoundedIcon />} label={active ? 'Active' : 'Expirée'} sx={{ fontWeight: 700 }} />;
}
