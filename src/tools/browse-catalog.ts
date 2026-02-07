import type { Car2DBApiClient } from '../api-client.js';
import type {
  Make,
  Model,
  Generation,
  Series,
  Trim,
  Equipment,
  PaginatedResponse,
} from '../types/api-types.js';

type CatalogLevel = 'makes' | 'models' | 'generations' | 'series' | 'trims' | 'equipments';

/**
 * Navigate the vehicle catalog hierarchy step by step
 */
export async function browseCatalog(
  apiClient: Car2DBApiClient,
  params: {
    level: CatalogLevel;
    makeId?: number;
    modelId?: number;
    generationId?: number;
    seriesId?: number;
    trimId?: number;
    typeId?: number;
  }
): Promise<Make[] | Model[] | Generation[] | Series[] | Trim[] | Equipment[]> {
  const queryParams: Record<string, string | number | boolean> = {
    pagination: false, // Disable pagination for browse_catalog
  };

  // Add typeId if specified
  if (params.typeId !== undefined) {
    queryParams.typeId = params.typeId;
  }

  let path: string;
  let response: PaginatedResponse<unknown> | unknown[];

  switch (params.level) {
    case 'makes':
      path = '/makes';
      response = await apiClient.get<PaginatedResponse<Make> | Make[]>(path, queryParams);
      return Array.isArray(response) ? (response as Make[]) : (response['hydra:member'] as Make[]);

    case 'models':
      path = '/models';
      if (params.makeId !== undefined) {
        queryParams.makeId = params.makeId;
      }
      response = await apiClient.get<PaginatedResponse<Model> | Model[]>(path, queryParams);
      return Array.isArray(response) ? (response as Model[]) : (response['hydra:member'] as Model[]);

    case 'generations':
      path = '/generations';
      if (params.modelId !== undefined) {
        queryParams.modelId = params.modelId;
      }
      response = await apiClient.get<PaginatedResponse<Generation> | Generation[]>(path, queryParams);
      return Array.isArray(response) ? (response as Generation[]) : (response['hydra:member'] as Generation[]);

    case 'series':
      path = '/series';
      if (params.modelId !== undefined) {
        queryParams.modelId = params.modelId;
      }
      if (params.generationId !== undefined) {
        queryParams.generationId = params.generationId;
      }
      response = await apiClient.get<PaginatedResponse<Series> | Series[]>(path, queryParams);
      return Array.isArray(response) ? (response as Series[]) : (response['hydra:member'] as Series[]);

    case 'trims':
      path = '/trims';
      if (params.seriesId !== undefined) {
        queryParams.seriesId = params.seriesId;
      }
      if (params.modelId !== undefined) {
        queryParams.modelId = params.modelId;
      }
      response = await apiClient.get<PaginatedResponse<Trim> | Trim[]>(path, queryParams);
      return Array.isArray(response) ? (response as Trim[]) : (response['hydra:member'] as Trim[]);

    case 'equipments':
      path = '/equipments';
      if (params.trimId !== undefined) {
        queryParams.trimId = params.trimId;
      }
      response = await apiClient.get<PaginatedResponse<Equipment> | Equipment[]>(path, queryParams);
      return Array.isArray(response) ? (response as Equipment[]) : (response['hydra:member'] as Equipment[]);

    default:
      throw new Error(`Unknown catalog level: ${params.level}`);
  }
}
