import type { Car2DBApiClient } from '../api-client.js';
import type { Make, PaginatedResponse } from '../types/api-types.js';

/**
 * List all vehicle makes (manufacturers)
 */
export async function listMakes(
  apiClient: Car2DBApiClient,
  params: {
    page?: number;
    itemsPerPage?: number;
    typeId?: number;
  }
): Promise<PaginatedResponse<Make>> {
  const queryParams: Record<string, string | number> = {};

  if (params.page !== undefined) {
    queryParams.page = params.page;
  }

  if (params.itemsPerPage !== undefined) {
    queryParams.itemsPerPage = params.itemsPerPage;
  }

  if (params.typeId !== undefined) {
    queryParams.typeId = params.typeId;
  }

  return apiClient.get<PaginatedResponse<Make>>('/makes', queryParams);
}
