import type { Car2DBApiClient } from '../api-client.js';
import type { Series, PaginatedResponse } from '../types/api-types.js';

/**
 * List vehicle series (body styles within a generation)
 */
export async function listSeries(
  apiClient: Car2DBApiClient,
  params: {
    modelId?: number;
    generationId?: number;
    typeId?: number;
    page?: number;
    itemsPerPage?: number;
  }
): Promise<PaginatedResponse<Series>> {
  const queryParams: Record<string, string | number> = {};

  if (params.modelId !== undefined) {
    queryParams.modelId = params.modelId;
  }

  if (params.generationId !== undefined) {
    queryParams.generationId = params.generationId;
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

  return apiClient.get<PaginatedResponse<Series>>('/series', queryParams);
}
