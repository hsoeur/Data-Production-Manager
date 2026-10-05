import axios from 'axios';
import { asCollection, httpClient } from '@pdm/shared/api';
import type { DatabaseNotification } from '../models/databaseNotification';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const runtimeParserUrl = window.APP_CONFIG?.apiParserUrl?.trim();
const buildParserUrl = import.meta.env.VITE_API_PARSER_URL?.trim();

const parserClient = axios.create({
  baseURL: trimTrailingSlash(runtimeParserUrl || buildParserUrl || 'http://localhost:7003/api'),
  timeout: 30_000,
  headers: { Accept: 'application/json' },
});

export const notificationsApi = {
  async runParser(): Promise<void> {
    await parserClient.get('/DatabaseNotificationParser/Run');
  },
  async list(): Promise<DatabaseNotification[]> {
    const response = await httpClient.get<unknown>('/DatabaseNotification/GetAll');
    return asCollection<DatabaseNotification>(response.data);
  },
  async search(keyword: string): Promise<DatabaseNotification[]> {
    const response = await httpClient.get<unknown>('/DatabaseNotification/Search', { params: { keyword: keyword.trim() } });
    return asCollection<DatabaseNotification>(response.data);
  },
  async process(uid: string, processedBy: string): Promise<void> {
    await httpClient.post('/DatabaseNotification/Process', null, { params: { uid, processedBy } });
  },
};
