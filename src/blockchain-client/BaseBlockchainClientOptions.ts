import {BlockchainType} from "../client/type/BlockchainType";

/**
 * BaseDataSourceOptions is set of BaseDataSourceOptions shared by all database types.
 */
export interface BaseBlockchainClientOptions {
    /**
     * Blockchain type. This value is required.
     */
    readonly type: BlockchainType
}
