/**
 * Postgres-specific connection options.
 */
import {BaseBlockchainClientOptions} from "../../blockchain-client/BaseBlockchainClientOptions";
import {TerraClientConfig} from "./TerraClientConfig";

export interface TerraConnectionOptions
    extends BaseBlockchainClientOptions,
        TerraClientConfig {
    /**
     * Blockchain type.
     */
    readonly type: "terra"

    /**
     * The client object
     * This defaults to `require("terra-money")`.
     */
    readonly client?: any
}
