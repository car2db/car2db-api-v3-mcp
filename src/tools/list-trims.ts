import type { Car2DBApiClient } from '../api-client.js';
import type { Trim, PaginatedResponse } from '../types/api-types.js';

/**
 * List vehicle trims (specific engine/transmission variants)
 */
export async function listTrims(
  apiClient: Car2DBApiClient,
  params: {
    seriesId?: number;
    modelId?: number;
    typeId?: number;
    page?: number;
    itemsPerPage?: number;
  }
): Promise<PaginatedResponse<Trim>> {
  const queryParams: Record<string, string | number> = {};

  if (params.seriesId !== undefined) {
    queryParams.seriesId = params.seriesId;
  }

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

  return apiClient.get<PaginatedResponse<Trim>>('/trims', queryParams);
}
