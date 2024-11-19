/**
 * Blockchain type.
 */
// export type BlockchainType =
//   | "ethereum"
//   | "xpla"
//   | "polygon"
export const BLOCKCHAINS = ["ethereum", "xpla", "polygon"] as const;
export type BlockchainType = typeof BLOCKCHAINS[number];