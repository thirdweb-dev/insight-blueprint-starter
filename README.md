# insight-blueprint-starter

To install dependencies:

```bash
pnpm install
```

To run:

```bash
pnpm dev
```

or for production

```bash
pnpm build && pnpm start
```

## Getting started

To get started, add your thirdweb API key to the `.env` file.

- Choose a project on [your team page](https://thirdweb.com/team) or create a new one
- Go to the project settings and copy the Client ID
- Create a copy of the `.env.example` file and rename it to `.env`
- Set the value of `THIRDWEB_CLIENT_ID` to your Client ID

```bash
THIRDWEB_CLIENT_ID=your_api_key
```

Edit the `src/index.ts` file to create your endpoints, define your source queries and return a response.

There are 2 example endpoints already created in the file as a starting point.

1. `GET /chains/:chainId/contracts/:address/transactions` - This endpoint fetches the latest transactions for a given address on a given chain.
2. `GET /usdt-transfers` - This endpoint fetches the latest USDT transfers events on ethereum and polygon.

### Running your blueprint

To run your blueprint locally run `pnpm dev`.

### Testing

To test your blueprint, run `pnpm test`.
