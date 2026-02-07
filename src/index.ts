#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { Car2DBApiClient } from './api-client.js';
import { createMcpServer } from './server.js';

/**
 * Validation of required environment variables
 */
function validateEnv(): {
  apiKey: string;
  language: string;
  transport: 'stdio' | 'sse';
  ssePort: number;
} {
  const apiKey = process.env.CAR2DB_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Use demo key if not provided
    const demoKey = 'demo_key_limited_access';
    console.error('⚠️  WARNING: CAR2DB_API_KEY not set, using demo key with limited access');
    console.error('   Get your own API key at: https://car2db.com/api/');
    console.error('   Or try demo key at: https://car2db.com/api-token-demo/');
    console.error('');
    return {
      apiKey: demoKey,
      language: process.env.CAR2DB_LANGUAGE || 'en-US',
      transport: (process.env.MCP_TRANSPORT || 'stdio') as 'stdio' | 'sse',
      ssePort: parseInt(process.env.MCP_SSE_PORT || '3000', 10)
    };
  }

  const language = process.env.CAR2DB_LANGUAGE || 'en-US';
  const transport = (process.env.MCP_TRANSPORT || 'stdio') as 'stdio' | 'sse';
  const ssePort = parseInt(process.env.MCP_SSE_PORT || '3000', 10);

  // Transport validation
  if (transport !== 'stdio' && transport !== 'sse') {
    console.error('ERROR: MCP_TRANSPORT must be either "stdio" or "sse"');
    process.exit(1);
  }

  // ssePort validation
  if (isNaN(ssePort) || ssePort < 1 || ssePort > 65535) {
    console.error('ERROR: MCP_SSE_PORT must be a valid port number (1-65535)');
    process.exit(1);
  }

  return { apiKey, language, transport, ssePort };
}

/**
 * Starting the server in stdio mode
 */
async function runStdioMode(apiClient: Car2DBApiClient): Promise<void> {
  const server = createMcpServer(apiClient);
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  
  console.error('Car2DB MCP Server running on stdio');
}

/**
 * Starting the server in SSE mode
 */
async function runSseMode(
  apiClient: Car2DBApiClient,
  port: number
): Promise<void> {
  const app = express();
  const server = createMcpServer(apiClient);

  app.use(express.json());

  // SSE endpoint
  app.get('/sse', async (_req, res) => {
    console.error('New SSE connection established');
    
    const transport = new SSEServerTransport('/messages', res);
    await server.connect(transport);
  });

  // Message endpoint
  app.post('/messages', async (_req, res) => {
    // SSEServerTransport handles POST requests
    res.status(200).send();
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'car2db-mcp' });
  });

  app.listen(port, () => {
    console.error(`Car2DB MCP Server running in SSE mode on http://localhost:${port}`);
    console.error(`SSE endpoint: http://localhost:${port}/sse`);
    console.error(`Messages endpoint: http://localhost:${port}/messages`);
    console.error(`Health check: http://localhost:${port}/health`);
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    const config = validateEnv();

    // Creating API client
    const apiClient = new Car2DBApiClient(
      config.apiKey,
      undefined,
      config.language
    );

    // Routing by transport
    if (config.transport === 'stdio') {
      await runStdioMode(apiClient);
    } else {
      await runSseMode(apiClient, config.ssePort);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Launch
main();
