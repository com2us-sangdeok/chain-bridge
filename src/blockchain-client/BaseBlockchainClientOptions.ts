import {BlockchainType} from "../client/type/BlockchainType";

export interface BaseBlockchainClientOptions {
    /**
     * Blockchain type. This value is required.
     */
    readonly type: BlockchainType
}
