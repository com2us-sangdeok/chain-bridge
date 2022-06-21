/**
 * BlockchainClientOptions is an interface with settings and options for specific Blockchain.
 */
import {EthereumConnectionOptions} from "../client/ethereum/EthereumConnectionOptions";
import {TerraConnectionOptions} from "../client/terra/TerraConnectionOptions";

export type BlockchainClientOptions =
    | EthereumConnectionOptions
    | TerraConnectionOptions
