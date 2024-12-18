/**
 * BlockchainClientOptions is an interface with settings and options for specific Blockchain.
 */
import { EthereumConnectionOptions } from "../client/ethereum/EthereumConnectionOptions";
import { XplaConnectionOptions } from "../client/xpla";

export type BlockchainClientOptions =
  | EthereumConnectionOptions
  | XplaConnectionOptions
