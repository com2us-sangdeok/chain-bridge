import {BaseBlockchainClientOptions} from "../blockchain-client/BaseBlockchainClientOptions";

export type ReturningType = "insert" | "update" | "delete"

export interface Client {
    /**
     * Connection options.
     */
    options: BaseBlockchainClientOptions

    /**
     * Blockchain name used to perform all write queries.
     */
    blockchain?: string

    createAccount(mnemonic: string): Promise<any>
    accountInfo(address: string): Promise<any>
}
