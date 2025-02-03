# Insight Blueprint Starter

A starter template for building custom blockchain data APIs using thirdweb's Insight Blueprint framework. This template allows you to create endpoints that fetch and process on-chain data across multiple networks.

## Overview

Insight Blueprint is a framework that enables you to:
- Create custom REST API endpoints for blockchain data
- Query multiple chains simultaneously
- Process and transform blockchain data
- Deploy as a standalone API service


## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [pnpm](https://pnpm.io/) package manager
- [thirdweb](https://thirdweb.com/) account and API key

## Installation

1. Clone this repository:
```bash
git clone https://github.com/thirdweb-example/insight-blueprint-starter
cd insight-blueprint-starter
```

2. Install dependencies:
```bash
pnpm install
```

## Configuration

1. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Add your thirdweb Client ID:
```bash
THIRDWEB_CLIENT_ID=your_api_key
```

To get your Client ID:
- Go to [thirdweb team dashboard](https://thirdweb.com/team)
- Select or create a project
- Navigate to project settings
- Copy the Client ID

## Usage

### Development

Run the development server:
```bash
pnpm dev
```

### Production

Build and start the production server:
```bash
pnpm build && pnpm start
```

### Testing

Run the test suite:
```bash
pnpm test
```

## Creating Endpoints

Endpoints are defined in `src/index.ts`. Each endpoint consists of:

1. Route definition
2. Query parameters (optional)
3. Source queries for blockchain data
4. Response transformation logic

### Creating a New Endpoint
Here simple example showing how to create an enpoint, defines the query params and Uses the Source class to fetch the transactions for a given contract.

```typescript
const access = new Access();

// ----------------- Register an endpoint -------------------
access.registerEndpoint({
  path: "/chains/:chainId/contracts/:address/transactions",
  method: "get",
  request: {
    params: z.object({
      chainId: z.string(),
      address: z.string().refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), {
        message: "Invalid EVM address",
      }),
    }),
  },
  response: z.object({ data: z.array(z.object({ hash: z.string() })) }),
  handler: async ({ params }) => {
    const source = new Source();
    if (params.chainId === "mumbai") {
      // ----------------- You can return custom errors -------------------
      throw new BlueprintAccessError("Chain not supported", 400);
    }
    // ----------------- Define the query you want to make to Insight -------------------
    const transactions = await source.transactions.get(params.chainId, {
      filters: {
        to_address: params.address,
      },
      orderBy: {
        field: ["block_number"],
        direction: "desc",
      },
      pagination: {
        limit: 10,
      },
    });
    // ----------------- Do any data transformations you'd like and return a response -------------------
    return { data: transactions.data.map((tx) => ({ hash: tx.hash })) };
  },
});

// ----------------- Start the server -------------------
access.start();
```

## Core Concepts

The Insight Blueprint framework is built around three main concepts:

### 1. Access Layer (`/lib/access`)

The access layer handles HTTP endpoints and API interactions. It provides:

- REST API endpoint creation and management
- Request/response validation using Zod schemas
- OpenAPI documentation generation
- Error handling and correlation ID tracking

Example of creating an endpoint:
```typescript
const app = new Access();

app.registerEndpoint({
  path: "/my-endpoint",
  method: "get",
  request: {
    query: z.object({
      address: z.string(),
    }),
  },
  response: z.object({
    data: z.array(z.any()),
  }),
  handler: async ({ query }) => {
    // Your endpoint logic here
    return { data: [] };
  },
});
```

### 2. Source Layer (`/lib/source`)

The source layer provides access to blockchain data sources. It includes:

- **Events Source**: Query and filter blockchain events
- **Transactions Source**: Query and filter blockchain transactions
- Query builders with filtering, pagination, and sorting
- Data aggregation capabilities

Example of using sources:
```typescript
const source = new Source();

// Fetch events
const events = await source.events.get("ethereum", {
  filters: {
    address: "0x...",
    block_number: { operator: "gte", value: 1000000 }
  },
  pagination: { limit: 100 }
});

// Fetch transactions
const txs = await source.transactions.get("polygon", {
  filters: {
    from_address: "0x..."
  }
});
```

### 3. Transformation Layer (`/lib/transformation`)

The transformation layer allows you to process and combine data from multiple sources:

- Transform raw blockchain data into desired formats
- Combine data from multiple chains or sources
- Apply custom business logic to the data

Example of using transformations:
```typescript
class MyTransformation implements Transformation<SourceData, ResultData> {
  async transform(data: SourceData): Promise<ResultData> {
    // Transform the data
    return transformedData;
  }
}
```


## Best Practices

1. **Error Handling**: Always implement proper error handling for your endpoints
2. **Rate Limiting**: Consider implementing rate limiting for production use
3. **Data Validation**: Validate input parameters before processing
4. **Caching**: Implement caching strategies for frequently accessed data
5. **Documentation**: Document your endpoints and expected responses

## Support

For support and questions:
- [thirdweb Documentation](https://portal.thirdweb.com/)
- [thirdweb Discord](https://discord.gg/thirdweb)
- [GitHub Issues](https://github.com/thirdweb-example/insight-blueprint-starter/issues)

## License

This project is licensed under the MIT License.