import { PlatformTools } from "../../platform/PlatformTools"
import {Client} from "../Client";
import {BlockchainClient} from "../../blockchain-client";
import {ClientPackageNotInstalledError} from "../../error/ClientPackageNotInstalledError";
import {Account} from "../type/Account";
import {EthereumConnectionOptions} from "./EthereumConnectionOptions";

export class EthereumClient implements Client {
    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    /**
     * Connection used by client.
     */
    connection: BlockchainClient

    /**
     * Terra underlying library.
     */
    ethereum: any


    // -------------------------------------------------------------------------
    // Public Implemented Properties
    // -------------------------------------------------------------------------

    /**
     * Connection options.
     */
    options: EthereumConnectionOptions

    /**
     * Master database used to perform all write queries.
     */
    blockchain?: string

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(connection: BlockchainClient) {
        this.connection = connection
        this.options = {
            ...connection.options,
        } as EthereumConnectionOptions

        // load terra package
        this.loadDependencies()
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    protected loadDependencies(): void {
        try {
            const web3 = this.options.client || PlatformTools.load("web3")
            console.log(web3)
        } catch (e) {
            throw new ClientPackageNotInstalledError(
                "web3",
                "web3",
            )
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    getBalance(address: string): any{
        return;
    }

    public createAccount(passphrase: string): Account {
        return {
            address: '',
            publicKey: '',
            privateKey: passphrase
        }
    }

    getSequence(address: string): Promise<number> {
        return Promise.resolve(0);
    }

    createTx( options: any): Promise<any> {
        return Promise.resolve(0);
    }

    async signTx(unsignedTx: any, privateKey: string): Promise<any> {
        return Promise.resolve(0);
    }

    // todo: check broadcastAsync, broadcastSync
    sendSignedTx(signedTx: any): Promise<any> {
        return Promise.resolve(0);
    }

    getTx(txhash: string): Promise<any> {
        return Promise.resolve(0);
    }

    async getFee(tx: any, feePayer: any): Promise<any> {
        return Promise.resolve(0);
    }

    decodeTx(encodedTx: string): any {
        return Promise.resolve(0);
    }

    encodeTx(tx: any): string {
        return "";
    }

    contractQuery(contract: any, query: any): Promise<any> {
        return Promise.resolve(0);
    }

    // only for terra
    wallet(mnemonic: string): any {
        return Promise.resolve(0);
    }

    getAccountNumber(wallet: any): Promise<number> {
        return Promise.resolve(0);
    }

    account(address: string): Promise<any> {
        return Promise.resolve(0);
    }

    getLcdClient():any{
        return 0
    }


}
