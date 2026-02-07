import type { Car2DBApiClient } from '../api-client.js';
import type { YearVehicles } from '../types/api-types.js';

/**
 * Get all makes and models available for a specific year
 */
export async function getYearVehicles(
  apiClient: Car2DBApiClient,
  params: {
    year: number;
    typeId?: number;
  }
): Promise<YearVehicles> {
  const queryParams: Record<string, string | number> = {};

  if (params.typeId !== undefined) {
    queryParams.typeId = params.typeId;
  }

  return apiClient.get<YearVehicles>(`/years/${params.year}`, queryParams);
}
