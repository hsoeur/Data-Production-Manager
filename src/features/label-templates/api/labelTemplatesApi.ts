import { asCollection, httpClient } from '../../../shared/api/httpClient';
import type { LabelTemplate, LabelTemplateInput, LabelType } from '../models/labelTemplate';

type ListOptions = { activeOnly: boolean; search: string };

export const labelTemplatesApi = {
  async list({ activeOnly, search }: ListOptions): Promise<LabelTemplate[]> {
    const keyword = search.trim();
    const path = keyword
      ? activeOnly ? '/LabelTemplates/active-search-by-keyword' : '/LabelTemplates/search-by-keyword'
      : activeOnly ? '/LabelTemplates/active' : '/LabelTemplates/all';
    const response = await httpClient.get<unknown>(path, { params: keyword ? { keyword } : undefined });
    return asCollection<LabelTemplate>(response.data);
  },
  async getLabelTypes(): Promise<LabelType[]> {
    const response = await httpClient.get<unknown>('/LabelTypes/all');
    return asCollection<LabelType>(response.data);
  },
  async create(input: LabelTemplateInput): Promise<LabelTemplate> {
    const response = await httpClient.post<LabelTemplate>('/LabelTemplates/create', input);
    return response.data;
  },
  async update(template: LabelTemplate): Promise<void> {
    await httpClient.put('/LabelTemplates/update', template);
  },
};
