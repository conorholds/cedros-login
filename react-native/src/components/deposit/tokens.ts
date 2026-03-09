/**
 * Token types and constants for deposit currency selection (React Native)
 *
 * Uses URL-based logos instead of imported assets.
 */

export interface Token {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

const TOKEN_LOGO_BASE =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet";

export const SUPPORTED_TOKENS: Token[] = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: `${TOKEN_LOGO_BASE}/So11111111111111111111111111111111111111112/logo.png`,
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: `${TOKEN_LOGO_BASE}/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png`,
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: `${TOKEN_LOGO_BASE}/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png`,
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
  },
];

export const SOL_TOKEN = SUPPORTED_TOKENS[0];

export const USD_STABLE_TOKENS = new Set([
  "USDC",
  "USDT",
  "USD1",
  "PYUSD",
  "USDH",
  "CASH",
]);
