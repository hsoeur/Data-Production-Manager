import { format, isAfter, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatProductionDate(value?: string): string {
  if (!value) return '—';
  const date = parseISO(value);
  if (!isValid(date)) return value;
  if (date.getUTCFullYear() >= 9999) return 'Sans expiration';
  return format(date, 'dd MMM yyyy', { locale: fr });
}

export function isSolderingProgramActive(endDate?: string): boolean {
  if (!endDate) return false;
  const date = parseISO(endDate);
  return isValid(date) && (date.getUTCFullYear() >= 9999 || isAfter(date, new Date()));
}
