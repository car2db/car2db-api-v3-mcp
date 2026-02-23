# Car2DB MCP Server

[![npm version](https://img.shields.io/npm/v/@car2db/mcp-server)](https://www.npmjs.com/package/@car2db/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for Car2DB API v3, enabling LLM agents (Claude, ChatGPT, Cursor, VSCode) to directly interact with automotive database.

## Features

- **Complete Vehicle Database** — Access detailed specifications for cars, motorcycles, and trucks
- **Smart Search** — Natural language vehicle search
- **Rich Data** — Technical specs, equipment packages, and detailed characteristics
- **Multi-language** — Support for 11 languages
- **Dual Transport** — stdio (Claude Desktop/Cursor) and SSE (remote access)
- **Docker Ready** — Production-ready containerization

## Quick Start

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "car2db": {
      "command": "npx",
      "args": ["-y", "@car2db/mcp-server"],
      "env": {
        "CAR2DB_API_KEY": "your_api_key_here",
        "CAR2DB_REFERER": "https://yourproject.com",
        "CAR2DB_LANGUAGE": "en-US"
      }
    }
  }
}
```

**Get your API key:** https://car2db.com/api/
**Try demo key:** https://car2db.com/api-token-demo/

### GitHub Copilot Configuration

For GitHub Copilot, use the `.vscode/mcp.json` configuration file in your project:

```json
{
  "servers": {
    "car2db": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "CAR2DB_API_KEY": "your_api_key_here",
        "CAR2DB_REFERER": "https://yourproject.com",
        "CAR2DB_LANGUAGE": "en-US",
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

Or use npx for zero-install:

```json
{
  "mcpServers": {
    "car2db": {
      "command": "npx",
      "args": ["-y", "@car2db/mcp-server"],
      "env": {
        "CAR2DB_API_KEY": "your_api_key_here",
        "CAR2DB_REFERER": "https://yourproject.com",
        "CAR2DB_LANGUAGE": "en-US"
      }
    }
  }
}
```

**Get your API key:** https://car2db.com/api/  
**Try demo key:** https://car2db.com/api-token-demo/

## Installation Options

### 1. MCPB Package (One-Click Install)

Download the pre-built MCPB extension for easy installation in Claude Desktop or other MCP clients:

**[Download car2db-api-v3-mcp.mcpb](https://github.com/car2db/car2db-api-v3-mcp/releases/latest/download/car2db-api-v3-mcp.mcpb)**

MCPB is a ZIP archive containing a local MCP server and `manifest.json` describing the server and its capabilities — just download and install with one click.

#### Installation Steps:
1. Download the `.mcpb` file from GitHub releases
2. Double-click the file or drag it into your MCP client
3. Configure your API key in the setup dialog (optional, demo key will be used if not provided)
4. Click "Install" and start using the extension

**GitHub Releases:** https://github.com/car2db/car2db-api-v3-mcp/releases

### 2. npx (Zero Install)

```bash
npx @car2db/mcp-server
```

### 3. Global npm Installation

```bash
npm install -g @car2db/mcp-server
car2db-mcp
```

### 4. Local Development

```bash
git clone https://github.com/car2db/car2db-api-v3-mcp.git
cd car2db-api-v3-mcp
npm install
npm run build
npm start
```

### 5. Docker (for SSE mode)

```bash
docker-compose up -d
```

Or manually:

```bash
docker build -t car2db-mcp .
docker run -p 3000:3000 \
  -e CAR2DB_API_KEY=your_key \
  -e CAR2DB_REFERER=https://yourproject.com \
  car2db-mcp
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CAR2DB_API_KEY` | ✅ | — | Bearer token for API authorization. Get it at [car2db.com/api](https://car2db.com/api/) |
| `CAR2DB_REFERER` | ✅ | — | URL of your project/site (e.g. `https://yourproject.com`). Must match the URL registered with your API key. |
| `CAR2DB_LANGUAGE` | ❌ | `en-US` | API response language: `en-US`, `ru-RU`, `de-DE`, `es-ES`, `it-IT`, `pl-PL`, `fr-FR`, `da-DA`, `lv-LV`, `th-TH`, `zh-CN` |
| `MCP_TRANSPORT` | ❌ | `stdio` | Transport mode: `stdio` (Claude Desktop/Cursor) or `sse` (HTTP Server-Sent Events) |
| `MCP_SSE_PORT` | ❌ | `3000` | Port for SSE mode (only used when `MCP_TRANSPORT=sse`) |

### Referer header

The Car2DB API requires a `Referer` header in every request. Set `CAR2DB_REFERER` to the URL of the project or site that uses this MCP server. This URL must match the one registered with your API key on [car2db.com](https://car2db.com/api/).

If `CAR2DB_REFERER` is not set, a warning is printed at startup and API requests will fail with `403 Forbidden`.

### Example .env file

```bash
CAR2DB_API_KEY=your_api_key_here
CAR2DB_REFERER=https://yourproject.com
CAR2DB_LANGUAGE=en-US
MCP_TRANSPORT=stdio
```

## Available Tools

### Smart Tools (High-Level)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `search_vehicles` | Natural language vehicle search | `q` (search text), `typeId`, `yearFrom`, `yearTo` |
| `get_trim_full` | Complete trim specifications | `trimId` |
| `get_equipment_full` | Full equipment/package details | `equipmentId` |
| `browse_catalog` | Navigate catalog hierarchy | `level` (makes/models/generations/series/trims/equipments), parent IDs |

### Low-Level Tools (Direct API Access)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `list_makes` | List all vehicle manufacturers | `page`, `itemsPerPage`, `typeId` |
| `list_models` | List models by make | `makeId`, `typeId`, pagination |
| `list_generations` | List model generations | `modelId`, `typeId`, pagination |
| `list_series` | List series (body styles) | `modelId`, `generationId`, `typeId`, pagination |
| `list_trims` | List trims (engine variants) | `seriesId`, `modelId`, `typeId`, pagination |
| `get_year_vehicles` | Vehicles by production year | `year`, `typeId` |

### Tool Parameters Reference

- **`typeId`**: Vehicle type filter
  - `1` = Cars
  - `2` = Motorcycles
  - `3` = Trucks

- **`page`**: Page number (default: 1)
- **`itemsPerPage`**: Items per page (default: 30)

## Usage Examples

### Example 1: Find specific vehicle specifications

```
Claude: "What are the specifications of 2020 BMW X5 xDrive40i?"

Agent workflow:
1. search_vehicles(q: "BMW X5 xDrive40i 2020")
2. get_trim_full(trimId: <from_search_results>)
3. Returns: breadcrumbs, key specs, full specifications, available equipments
```

### Example 2: Compare equipment packages

```
Claude: "Compare equipment packages for Toyota Camry 2023"

Agent workflow:
1. search_vehicles(q: "Toyota Camry 2023")
2. get_trim_full(trimId: ...) → get equipment list
3. get_equipment_full(equipmentId: A) → package A options
4. get_equipment_full(equipmentId: B) → package B options
5. Compare and present differences
```

### Example 3: Browse catalog

```
Claude: "Show me all Tesla models"

Agent workflow:
1. browse_catalog(level: "makes") → find Tesla
2. browse_catalog(level: "models", makeId: 56) → all Tesla models
3. browse_catalog(level: "trims", modelId: 789) → trims for Model 3
```

### Example 4: Year-based search

```
Claude: "What electric SUVs were available in 2024?"

Agent workflow:
1. get_year_vehicles(year: 2024, typeId: 1)
2. Filter for electric powertrains
3. Filter for SUV body types
4. Present results
```

## SSE Mode (Remote Access)

For remote access or integration with web services, use SSE transport:

### Start SSE Server

```bash
export MCP_TRANSPORT=sse
export MCP_SSE_PORT=3000
npm start
```

Or with Docker:

```bash
docker-compose up -d
```

### SSE Endpoints

- **SSE Connection:** `GET http://localhost:3000/sse`
- **Messages:** `POST http://localhost:3000/messages`
- **Health Check:** `GET http://localhost:3000/health`

## API Coverage

This MCP server provides access to Car2DB API v3 endpoints:

- `/search/vehicles` — Vehicle search
- `/makes` — Manufacturers list
- `/models` — Vehicle models
- `/generations` — Model generations
- `/series` — Body style series
- `/trims` — Engine/transmission trims
- `/trims/{id}/full` — Complete trim data
- `/equipments/{id}/full` — Equipment packages
- `/years/{year}` — Vehicles by year

**Base URL:** `https://v3.api.car2db.com`

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Development Mode

```bash
npm run dev
```

## Get API Access

- **Purchase API Key:** https://car2db.com/api/
- **Try Demo Key:** https://car2db.com/api-token-demo/
- **API Documentation:** https://v3.api.car2db.com/docs

## Requirements

- Node.js >= 20.0.0
- Valid Car2DB API key

## License

MIT License

## Links

- **Repository:** https://github.com/car2db/car2db-api-v3-mcp
- **npm Package:** https://www.npmjs.com/package/@car2db/mcp-server
- **Car2DB API:** https://car2db.com/api/
- **Model Context Protocol:** https://modelcontextprotocol.io/

## Support

For API-related questions and support:
- Email: support@car2db.com
- Website: https://car2db.com
- Telegram: https://t.me/car2db_support_bot

For MCP server issues:
- GitHub Issues: https://github.com/car2db/car2db-api-v3-mcp/issues
