import { format, isAfter, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function toDateInput(value?: string): string {
  if (!value) return '';
  const date = parseISO(value);
  return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
}

export function dateInputToIso(value: string, endOfDay = false): string {
  return `${value}${endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'}`;
}

export function formatProductionDate(value?: string): string {
  if (!value) return '—';
  const date = parseISO(value);
  if (!isValid(date)) return value;
  if (date.getUTCFullYear() >= 9999) return 'Sans expiration';
  return format(date, 'dd MMM yyyy', { locale: fr });
}

export function isToleranceActive(endDate: string): boolean {
  const date = parseISO(endDate);
  return isValid(date) && isAfter(date, new Date());
}
