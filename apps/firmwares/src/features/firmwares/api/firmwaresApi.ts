import { asCollection, httpClient } from '@pdm/shared/api';
import type { Firmware, FirmwareUpdate } from '../models/firmware';

function assertBusinessSuccess(response: unknown, accepted: string[], fallback: string): void {
  if (typeof response !== 'string') return;
  if (accepted.some((value) => response.toUpperCase().includes(value))) return;
  throw new Error(response.trim() || fallback);
}

export const firmwaresApi = {
  async list(activeOnly: boolean, keyword: string): Promise<Firmware[]> {
    const trimmedKeyword = keyword.trim();
    const path = trimmedKeyword
      ? `/Firmwares/${activeOnly ? 'by-keyword-active' : 'by-keyword'}`
      : `/Firmwares/${activeOnly ? 'active' : 'all'}`;
    const response = await httpClient.get<unknown>(path, {
      params: trimmedKeyword ? { keyword: trimmedKeyword } : undefined,
    });
    return asCollection<Firmware>(response.data);
  },

  async update(firmware: FirmwareUpdate): Promise<void> {
    const response = await httpClient.put<unknown>('/Firmwares/update', firmware);
    assertBusinessSuccess(response.data, ['SUCCESS', 'SUCESS'], 'Le firmware n’a pas pu être mis à jour.');
  },

  async linkFile(firmware: Firmware, file: string): Promise<void> {
    const response = await httpClient.put<unknown>('/Firmwares/link-firmware-file', { ...firmware, file });
    assertBusinessSuccess(response.data, ['SUCCESS LINKED'], 'Le fichier n’a pas pu être lié.');
  },

  async setSuspended(firmware: Firmware, suspended: boolean): Promise<void> {
    const response = await httpClient.put<unknown>(`/Firmwares/${suspended ? 'suspend' : 'unsuspend'}`, firmware);
    assertBusinessSuccess(response.data, [suspended ? 'SUCCESS SUSPENDED' : 'SUCCESS UNSUSPENDED'], 'Le statut n’a pas pu être modifié.');
  },
};
