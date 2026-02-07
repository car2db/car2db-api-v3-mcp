import type { Car2DBApiClient } from '../api-client.js';
import type { VehicleSearchResult, PaginatedResponse } from '../types/api-types.js';

/**
 * Search for vehicles using natural language
 */
export async function searchVehicles(
  apiClient: Car2DBApiClient,
  params: {
    q: string;
    typeId?: number;
    yearFrom?: number;
    yearTo?: number;
  }
): Promise<VehicleSearchResult[]> {
  const queryParams: Record<string, string | number> = {
    q: params.q,
  };

  if (params.typeId !== undefined) {
    queryParams.typeId = params.typeId;
  }

  if (params.yearFrom !== undefined) {
    queryParams.yearFrom = params.yearFrom;
  }

  if (params.yearTo !== undefined) {
    queryParams.yearTo = params.yearTo;
  }

  const response = await apiClient.get<PaginatedResponse<VehicleSearchResult> | VehicleSearchResult[]>(
    '/search/vehicles',
    queryParams
  );

  // API can return either an array directly or an object with hydra:member
  if (Array.isArray(response)) {
    return response;
  } else {
    return response['hydra:member'];
  }
}
