/**
 * Ethereum-specific ethereum options.
 */
import { BaseBlockchainClientOptions } from "../../blockchain-client/BaseBlockchainClientOptions";
import { EthereumClientConfig } from "./EthereumClientConfig";

export interface EthereumConnectionOptions
  extends BaseBlockchainClientOptions,
    EthereumClientConfig {

  readonly type: "ethereum" | "polygon"
  readonly client?: any
}
