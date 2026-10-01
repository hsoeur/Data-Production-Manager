import axios, { AxiosError } from 'axios';
import { appConfig } from '../../app/config';

export const httpClient = axios.create({
  baseURL: appConfig.apiDataBaseUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

type ProblemDetails = { detail?: string; title?: string };

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof AxiosError)) return fallback;
  if (!error.response) return "Le service de données est injoignable. Vérifiez la connexion et l'adresse de l'API.";
  const data = error.response.data as ProblemDetails | string | undefined;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (data.detail) return data.detail;
    if (data.title) return data.title;
  }
  return fallback;
}

export function asCollection<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
