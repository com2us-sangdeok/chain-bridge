import { BaseBlockchainClientOptions } from "../blockchain-client/BaseBlockchainClientOptions";
import { Account } from "./type/Account";
import { LCDClient } from "@terra-money/terra.js";

export interface Client {
    /**
     * Connection options.
     */
    options: BaseBlockchainClientOptions
    blockchain?: string


    //denom => only for terra
    getBalance(address: string): any

    createAccount(passphrase: string): Account

    getSequence(wallet: any): Promise<number>

    createTx(options: any): Promise<any>

    signTx(unsignedTx: any, signData: any): Promise<any>

    sendSignedTx(transaction: any): Promise<any>

    getTx(txhash: string): Promise<any>

    getFee(tx: any, feePayer: any, signerList?: string[]): any

    encodeTx(tx: any): string

    decodeTx(encodedTx: string): any

    contractQuery(contract: any, query: any): Promise<any> //for view, queries

    // only for terra
    wallet(mnemonic: string): any

    getAccountNumber(wallet: any): Promise<number>

    account(address: string): Promise<any>

    getLcdClient(): LCDClient

}
