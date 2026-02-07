import type { Car2DBApiClient } from '../api-client.js';
import type { Model, PaginatedResponse } from '../types/api-types.js';

/**
 * List vehicle models
 */
export async function listModels(
  apiClient: Car2DBApiClient,
  params: {
    makeId?: number;
    typeId?: number;
    page?: number;
    itemsPerPage?: number;
  }
): Promise<PaginatedResponse<Model>> {
  const queryParams: Record<string, string | number> = {};

  if (params.makeId !== undefined) {
    queryParams.makeId = params.makeId;
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

  return apiClient.get<PaginatedResponse<Model>>('/models', queryParams);
}
