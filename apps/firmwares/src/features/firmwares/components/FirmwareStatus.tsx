import { Chip } from '@mui/material';
import type { Firmware } from '../models/firmware';

export function FirmwareStatus({ firmware }: { firmware: Firmware }) {
  if (new Date(firmware.endDate).getUTCFullYear() < 9999) {
    return <Chip size="small" label="Historique" sx={{ bgcolor: '#F0F1F4', color: '#5C6373', fontWeight: 750 }} />;
  }
  if (firmware.isSuspended) {
    return <Chip size="small" label="Suspendu" sx={{ bgcolor: '#FFF1E8', color: '#9A4A16', fontWeight: 750 }} />;
  }
  return <Chip size="small" label="Disponible" sx={{ bgcolor: '#EAF7F0', color: '#24724B', fontWeight: 750 }} />;
}
