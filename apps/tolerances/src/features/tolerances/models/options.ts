import type { ToleranceMode } from './tolerance';

export const toleranceModes: Array<{ value: ToleranceMode; label: string }> = [
  { value: 'Between', label: 'Compris entre' },
  { value: 'Equal', label: 'Égale à' },
  { value: 'Min', label: 'Minimum' },
  { value: 'Max', label: 'Maximum' },
  { value: 'Record', label: 'Enregistrement' },
  { value: 'Entry', label: 'Saisie' },
];

export const toleranceUnits = [
  { value: '%', label: 'Pourcentage' },
  { value: '°C', label: 'Température (°C)' },
  { value: '°F', label: 'Température (°F)' },
  { value: 'Aac', label: 'Courant alternatif' },
  { value: 'Adc', label: 'Courant continu' },
  { value: 'Char', label: 'Chaîne de caractères' },
  { value: 'Hz', label: 'Fréquence' },
  { value: 'Ohms', label: 'Résistance' },
  { value: 's', label: 'Temps (secondes)' },
  { value: 'Vac', label: 'Tension alternative' },
  { value: 'Vdc', label: 'Tension continue' },
];
