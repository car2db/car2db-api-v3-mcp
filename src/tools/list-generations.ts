import type { Car2DBApiClient } from '../api-client.js';
import type { Generation, PaginatedResponse } from '../types/api-types.js';

/**
 * List model generations (facelifts/redesigns)
 */
export async function listGenerations(
  apiClient: Car2DBApiClient,
  params: {
    modelId?: number;
    typeId?: number;
    page?: number;
    itemsPerPage?: number;
  }
): Promise<PaginatedResponse<Generation>> {
  const queryParams: Record<string, string | number> = {};

  if (params.modelId !== undefined) {
    queryParams.modelId = params.modelId;
  }

  if (params.typeId !== undefined) {
    queryParams.typeId = params.typeId;
  }

  if (params.page !== undefined) {
    queryParams.page = params.page;
  }

  if (params.itemsPerPage !== undefined) {
    queryParams.itemsPerPage = params.itemsPerPage;
  }

  return apiClient.get<PaginatedResponse<Generation>>('/generations', queryParams);
}
