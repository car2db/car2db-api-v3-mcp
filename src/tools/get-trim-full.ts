import type { Car2DBApiClient } from '../api-client.js';
import type { TrimFull } from '../types/api-types.js';

/**
 * Get complete vehicle trim specifications
 */
export async function getTrimFull(
  apiClient: Car2DBApiClient,
  params: {
    trimId: number;
  }
): Promise<TrimFull> {
  const response = await apiClient.get<TrimFull>(
    `/trims/${params.trimId}/full`
  );

  return response;
}
