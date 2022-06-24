import {BaseBlockchainClientOptions} from "../blockchain-client/BaseBlockchainClientOptions";
import {Account} from "./type/Account";

export type ReturningType = "insert" | "update" | "delete"

export interface Client {
    /**
     * Connection options.
     */
    options: BaseBlockchainClientOptions
    blockchain?: string

    createAccount(passphrase: string): Account
    signTransaction(transaction: any, privateKey: string): Promise<any>
    sendSignedTransaction(transaction: string): Promise<any>
    getSequence(address: string): Promise<number>
    getTransaction(txhash: string): Promise<any>
    // decodeRawTransaction(transaction: string): any;
    // callContract(): void //view
}
