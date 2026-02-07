import type { Car2DBApiClient } from '../api-client.js';
import type { EquipmentFull } from '../types/api-types.js';

/**
 * Get full equipment/package details
 */
export async function getEquipmentFull(
  apiClient: Car2DBApiClient,
  params: {
    equipmentId: number;
  }
): Promise<EquipmentFull> {
  const response = await apiClient.get<EquipmentFull>(
    `/equipments/${params.equipmentId}/full`
  );

  return response;
}
