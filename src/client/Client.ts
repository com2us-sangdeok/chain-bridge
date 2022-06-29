import {BaseBlockchainClientOptions} from "../blockchain-client/BaseBlockchainClientOptions";
import {Account} from "./type/Account";
import {CreateTxOptions, SignerOptions} from "@terra-money/terra.js";

export interface Client {
    /**
     * Connection options.
     */
    options: BaseBlockchainClientOptions
    blockchain?: string

    createAccount(passphrase: string): Account

    // todo: check ethereum nonce
    getSequence(wallet: any): Promise<number>
    // todo: check ethereum create tx
    createTx(signers: SignerOptions[], options: CreateTxOptions): Promise<any>
    // todo: check ethereum sign tx
    signTx(unsignedTx: any, signData: any): Promise<any>
    sendSignedTx(transaction: any): Promise<any>
    getTx(txhash: string): Promise<any>
    // todo: check ethereum get fee
    getFee(tx: any, feePayer: any): any
    encodeTx(tx: any): string
    decodeTx(encodedTx: string): any
    contractQuery(contractAddress: string, query: any): Promise<any> //for view, queries

    // only for terra
    wallet(mnemonic: string): any
    getAccountNumber(wallet: any): Promise<number>
    account(address: string): Promise<any>
}
