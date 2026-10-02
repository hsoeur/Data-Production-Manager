import { asCollection, httpClient } from '../../../shared/api/httpClient';
import type { User } from '../models/user';

export const usersApi = {
  async getCurrent(): Promise<User[]> {
    const response = await httpClient.get<unknown>('/Users/current');
    return asCollection<User>(response.data).sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'fr'));
  },
};
