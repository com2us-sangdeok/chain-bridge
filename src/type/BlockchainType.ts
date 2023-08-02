/**
 * Blockchain type.
 */
// export type BlockchainType =
//   | "ethereum"
//   | "terra"
//   | "xpla"
//   | "polygon"
export const BLOCKCHAINS = ["ethereum", "terra", "xpla", "polygon"] as const;
export type BlockchainType = typeof BLOCKCHAINS[number];