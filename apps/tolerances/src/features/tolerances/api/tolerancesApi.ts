import { asCollection, httpClient } from '@pdm/shared/api';
import type { CopyToleranceBatchRequest, CopyToleranceBatchResponse, Machine, Tolerance, ToleranceInput } from '../models/tolerance';

type ApiTolerance = Omit<Tolerance, 'unitUid'> & { unitUid?: string; unit?: string };

function normalizeTolerance(value: ApiTolerance): Tolerance {
  return { ...value, unitUid: value.unitUid ?? value.unit ?? '' };
}

export const tolerancesApi = {
  async list(activeOnly: boolean): Promise<Tolerance[]> {
    const response = await httpClient.get<unknown>(`/Tolerances/${activeOnly ? 'active' : 'all'}`);
    return asCollection<ApiTolerance>(response.data).map(normalizeTolerance);
  },

  async getMachines(): Promise<Machine[]> {
    const response = await httpClient.get<unknown>('/Machines/all');
    return asCollection<Machine>(response.data)
      .filter((machine) => machine.machineUid !== 'MachineUid' && machine.label !== 'Label')
      .sort((a, b) => a.machineUid.localeCompare(b.machineUid, 'fr'));
  },

  async create(input: ToleranceInput): Promise<Tolerance> {
    const response = await httpClient.post<ApiTolerance>('/Tolerances/create', input);
    return normalizeTolerance(response.data);
  },

  async update(tolerance: Tolerance): Promise<Tolerance> {
    const { toleranceUid, ...input } = tolerance;
    const response = await httpClient.put<ApiTolerance>(`/Tolerances/update/${encodeURIComponent(toleranceUid)}`, input);
    return normalizeTolerance(response.data);
  },

  async copyBatch(input: CopyToleranceBatchRequest): Promise<CopyToleranceBatchResponse> {
    const response = await httpClient.post<CopyToleranceBatchResponse>('/Tolerances/batch-copy', input);
    return response.data;
  },
};
