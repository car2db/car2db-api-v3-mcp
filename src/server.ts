import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Car2DBApiClient } from './api-client.js';
import { searchVehicles } from './tools/search-vehicles.js';
import { getTrimFull } from './tools/get-trim-full.js';
import { getEquipmentFull } from './tools/get-equipment-full.js';
import { browseCatalog } from './tools/browse-catalog.js';
import { listMakes } from './tools/list-makes.js';
import { listModels } from './tools/list-models.js';
import { listGenerations } from './tools/list-generations.js';
import { listSeries } from './tools/list-series.js';
import { listTrims } from './tools/list-trims.js';
import { getYearVehicles } from './tools/get-year-vehicles.js';

/**
 * Creating and configuring MCP server for Car2DB API
 */
export function createMcpServer(apiClient: Car2DBApiClient): Server {
  const server = new Server(
    {
      name: 'car2db',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Registering the initialize handler to capture client info
  server.setRequestHandler(InitializeRequestSchema, async (request) => {
    const clientInfo = request.params.clientInfo;
    
    if (clientInfo) {
      const referer = `${clientInfo.name}/${clientInfo.version}`;
      apiClient.setReferer(referer);
      console.error(`Client connected: ${referer}`);
    }
    
    return {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: 'car2db',
        version: '1.0.0',
      },
    };
  });

  // Registering the list tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        // Smart Tools
        {
          name: 'search_vehicles',
          description:
            'Search for vehicles using natural language. Examples: "Toyota Camry 2020", "BMW diesel SUV", "electric cars". Returns models with matching trims grouped by relevance.',
          inputSchema: {
            type: 'object',
            properties: {
              q: {
                type: 'string',
                description: 'Search text (vehicle name, brand, model, etc.)',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
              yearFrom: {
                type: 'number',
                description: 'Minimum year inclusive',
              },
              yearTo: {
                type: 'number',
                description: 'Maximum year inclusive',
              },
            },
            required: ['q'],
          },
        },
        {
          name: 'get_trim_full',
          description:
            'Get complete vehicle trim specifications in one call. Returns: breadcrumbs (make→model→generation→series→trim), key specs (engine, power, transmission), all specifications grouped by category, and available equipments. Use trim IDs from search_vehicles or list_trims results.',
          inputSchema: {
            type: 'object',
            properties: {
              trimId: {
                type: 'number',
                description: 'Trim ID',
              },
            },
            required: ['trimId'],
          },
        },
        {
          name: 'get_equipment_full',
          description:
            'Get full equipment/package details including all options. Returns: breadcrumbs, complete list of options grouped by category. Use equipment IDs from get_trim_full results.',
          inputSchema: {
            type: 'object',
            properties: {
              equipmentId: {
                type: 'number',
                description: 'Equipment ID',
              },
            },
            required: ['equipmentId'],
          },
        },
        {
          name: 'browse_catalog',
          description:
            'Navigate the vehicle catalog hierarchy step by step. Levels: makes → models → generations → series → trims → equipments. Start with level="makes", then drill down using parent IDs from results.',
          inputSchema: {
            type: 'object',
            properties: {
              level: {
                type: 'string',
                enum: ['makes', 'models', 'generations', 'series', 'trims', 'equipments'],
                description: 'Catalog level to browse',
              },
              makeId: {
                type: 'number',
                description: 'Filter models by make',
              },
              modelId: {
                type: 'number',
                description: 'Filter generations/series/trims by model',
              },
              generationId: {
                type: 'number',
                description: 'Filter series by generation',
              },
              seriesId: {
                type: 'number',
                description: 'Filter trims by series',
              },
              trimId: {
                type: 'number',
                description: 'Filter equipments by trim',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
            },
            required: ['level'],
          },
        },
        // Low-Level Tools
        {
          name: 'list_makes',
          description:
            'List all vehicle makes (manufacturers). Supports pagination and filtering by vehicle type.',
          inputSchema: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              itemsPerPage: {
                type: 'number',
                description: 'Items per page (default: 30)',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
            },
          },
        },
        {
          name: 'list_models',
          description:
            'List vehicle models, optionally filtered by make. Returns model names and IDs for further drill-down.',
          inputSchema: {
            type: 'object',
            properties: {
              makeId: {
                type: 'number',
                description: 'Filter by make',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              itemsPerPage: {
                type: 'number',
                description: 'Items per page (default: 30)',
              },
            },
          },
        },
        {
          name: 'list_generations',
          description:
            'List model generations (facelifts/redesigns). Filter by model to see all generations of a specific model.',
          inputSchema: {
            type: 'object',
            properties: {
              modelId: {
                type: 'number',
                description: 'Filter by model',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              itemsPerPage: {
                type: 'number',
                description: 'Items per page (default: 30)',
              },
            },
          },
        },
        {
          name: 'list_series',
          description:
            'List vehicle series (body styles within a generation). Filter by model or generation.',
          inputSchema: {
            type: 'object',
            properties: {
              modelId: {
                type: 'number',
                description: 'Filter by model',
              },
              generationId: {
                type: 'number',
                description: 'Filter by generation',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              itemsPerPage: {
                type: 'number',
                description: 'Items per page (default: 30)',
              },
            },
          },
        },
        {
          name: 'list_trims',
          description:
            'List vehicle trims (specific engine/transmission variants). Filter by series or model. Use trim IDs with get_trim_full for complete specs.',
          inputSchema: {
            type: 'object',
            properties: {
              seriesId: {
                type: 'number',
                description: 'Filter by series',
              },
              modelId: {
                type: 'number',
                description: 'Filter by model',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              itemsPerPage: {
                type: 'number',
                description: 'Items per page (default: 30)',
              },
            },
          },
        },
        {
          name: 'get_year_vehicles',
          description:
            'Get all makes and models available for a specific year. Useful for exploring what vehicles were produced in a given year.',
          inputSchema: {
            type: 'object',
            properties: {
              year: {
                type: 'number',
                description: 'Production year',
              },
              typeId: {
                type: 'number',
                description: 'Vehicle type filter: 1=cars, 2=motorcycles, 3=trucks',
              },
            },
            required: ['year'],
          },
        },
      ],
    };
  });

  // Registering the tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      let result: unknown;

      switch (name) {
        case 'search_vehicles':
          result = await handleSearchVehicles(apiClient, args);
          break;
        case 'get_trim_full':
          result = await handleGetTrimFull(apiClient, args);
          break;
        case 'get_equipment_full':
          result = await handleGetEquipmentFull(apiClient, args);
          break;
        case 'browse_catalog':
          result = await handleBrowseCatalog(apiClient, args);
          break;
        case 'list_makes':
          result = await handleListMakes(apiClient, args);
          break;
        case 'list_models':
          result = await handleListModels(apiClient, args);
          break;
        case 'list_generations':
          result = await handleListGenerations(apiClient, args);
          break;
        case 'list_series':
          result = await handleListSeries(apiClient, args);
          break;
        case 'list_trims':
          result = await handleListTrims(apiClient, args);
          break;
        case 'get_year_vehicles':
          result = await handleGetYearVehicles(apiClient, args);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: errorMessage,
                details: error,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Tool handlers
async function handleSearchVehicles(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return searchVehicles(apiClient, {
    q: String(args.q),
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
    yearFrom: args.yearFrom !== undefined ? Number(args.yearFrom) : undefined,
    yearTo: args.yearTo !== undefined ? Number(args.yearTo) : undefined,
  });
}

async function handleGetTrimFull(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return getTrimFull(apiClient, {
    trimId: Number(args.trimId),
  });
}

async function handleGetEquipmentFull(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return getEquipmentFull(apiClient, {
    equipmentId: Number(args.equipmentId),
  });
}

async function handleBrowseCatalog(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return browseCatalog(apiClient, {
    level: String(args.level) as 'makes' | 'models' | 'generations' | 'series' | 'trims' | 'equipments',
    makeId: args.makeId !== undefined ? Number(args.makeId) : undefined,
    modelId: args.modelId !== undefined ? Number(args.modelId) : undefined,
    generationId: args.generationId !== undefined ? Number(args.generationId) : undefined,
    seriesId: args.seriesId !== undefined ? Number(args.seriesId) : undefined,
    trimId: args.trimId !== undefined ? Number(args.trimId) : undefined,
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
  });
}

async function handleListMakes(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return listMakes(apiClient, {
    page: args.page !== undefined ? Number(args.page) : undefined,
    itemsPerPage: args.itemsPerPage !== undefined ? Number(args.itemsPerPage) : undefined,
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
  });
}

async function handleListModels(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return listModels(apiClient, {
    makeId: args.makeId !== undefined ? Number(args.makeId) : undefined,
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
    page: args.page !== undefined ? Number(args.page) : undefined,
    itemsPerPage: args.itemsPerPage !== undefined ? Number(args.itemsPerPage) : undefined,
  });
}

async function handleListGenerations(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return listGenerations(apiClient, {
    modelId: args.modelId !== undefined ? Number(args.modelId) : undefined,
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
    page: args.page !== undefined ? Number(args.page) : undefined,
    itemsPerPage: args.itemsPerPage !== undefined ? Number(args.itemsPerPage) : undefined,
  });
}

async function handleListSeries(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return listSeries(apiClient, {
    modelId: args.modelId !== undefined ? Number(args.modelId) : undefined,
    generationId: args.generationId !== undefined ? Number(args.generationId) : undefined,
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
    page: args.page !== undefined ? Number(args.page) : undefined,
    itemsPerPage: args.itemsPerPage !== undefined ? Number(args.itemsPerPage) : undefined,
  });
}

async function handleListTrims(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return listTrims(apiClient, {
    seriesId: args.seriesId !== undefined ? Number(args.seriesId) : undefined,
    modelId: args.modelId !== undefined ? Number(args.modelId) : undefined,
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
    page: args.page !== undefined ? Number(args.page) : undefined,
    itemsPerPage: args.itemsPerPage !== undefined ? Number(args.itemsPerPage) : undefined,
  });
}

async function handleGetYearVehicles(
  apiClient: Car2DBApiClient,
  args: Record<string, unknown>
): Promise<unknown> {
  return getYearVehicles(apiClient, {
    year: Number(args.year),
    typeId: args.typeId !== undefined ? Number(args.typeId) : undefined,
  });
}
