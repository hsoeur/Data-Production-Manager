import { asCollection, httpClient } from '@pdm/shared/api';
import type { SolderingProgram, SolderingProgramCreateInput } from '../models/solderingProgram';
import { isSolderingProgramActive } from '../utils/dates';

type ListOptions = { activeOnly: boolean; search: string };

export const solderingProgramsApi = {
  async list({ activeOnly, search }: ListOptions): Promise<SolderingProgram[]> {
    const keyword = search.trim();
    const path = keyword
      ? '/SolderingPrograms/search-by-keyword'
      : activeOnly ? '/SolderingPrograms/active' : '/SolderingPrograms/all';
    const response = await httpClient.get<unknown>(path, { params: keyword ? { keyword } : undefined });
    const programs = asCollection<SolderingProgram>(response.data);
    return activeOnly && keyword ? programs.filter((program) => isSolderingProgramActive(program.endDate)) : programs;
  },
  async create(input: SolderingProgramCreateInput): Promise<SolderingProgram> {
    const response = await httpClient.post<SolderingProgram>('/SolderingPrograms/create', input);
    return response.data;
  },
  async update(program: SolderingProgram): Promise<void> {
    await httpClient.put('/SolderingPrograms/update', program);
  },
};
