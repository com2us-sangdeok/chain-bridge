/**
 * Postgres-specific connection options.
 */
import {BaseBlockchainClientOptions} from "../../blockchain-client/BaseBlockchainClientOptions";
import {EthereumClientConfig} from "./EthereumClientConfig";

export interface EthereumConnectionOptions
    extends BaseBlockchainClientOptions,
        EthereumClientConfig {
    /**
     * Blockchain type.
     */
    readonly type: "ethereum"

    /**
     * The client object
     * This defaults to `require("@terra-money")`.
     */
    readonly client?: any
}
