/**
 * Terra-specific terra options.
 */
import {BaseBlockchainClientOptions} from "../../blockchain-client/BaseBlockchainClientOptions";
import {TerraClientConfig} from "./TerraClientConfig";

export interface TerraConnectionOptions
    extends BaseBlockchainClientOptions,
        TerraClientConfig {

    readonly type: "terra"
    readonly client?: any
}
