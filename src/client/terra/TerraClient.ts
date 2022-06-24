import { PlatformTools } from "../../platform/PlatformTools"
import {Client} from "../Client";
import {BlockchainClient} from "../../blockchain-client";
import {TerraConnectionOptions} from "./TerraConnectionOptions";
import {ClientPackageNotInstalledError} from "../../error/ClientPackageNotInstalledError";
import {Account} from "../type/Account";
import {ChainBridgeError} from "../../error/ChainBridgeError";

export class TerraClient implements Client {
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
    terra: any

    lcd: any

    // -------------------------------------------------------------------------
    // Public Implemented Properties
    // -------------------------------------------------------------------------

    /**
     * Connection options.
     */
    options: TerraConnectionOptions

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
        } as TerraConnectionOptions

        // load terra package
        this.loadDependencies()
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    protected loadDependencies(): void {
        try {
            const terra = this.options.client || PlatformTools.load("terra")
            this.terra = terra;
            this.lcd = new this.terra.LCDClient({
                URL: this.options.nodeURL,
                chainID: this.options.chainID
            })
        } catch (e) {
            throw new ClientPackageNotInstalledError(
                "Terra",
                "terra",
            )
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public createAccount(mnemonic: string): Account {
        const mk = new this.terra.MnemonicKey({
            mnemonic: mnemonic,
        });

        const account: Account = {
            address: mk.accAddress,
            publicKey: mk.publicKey.key,
            privateKey: mk.mnemonic
        }

        try {
            this.lcd.wallet(mk)
        } catch (e) {
            throw new ChainBridgeError(`error occurred while creating an account.`)
        }

        return account;
    }

    getSequence(address: string): Promise<number> {
        return Promise.resolve(0);
    }

    getTransaction(txhash: string): Promise<any> {
        return Promise.resolve(undefined);
    }

    sendSignedTransaction(transaction: string): Promise<any> {
        const tx = this.lcd.tx.decode(transaction)
        return this.lcd.tx.broadcast(tx);
    }

    signTransaction(transaction: any, privateKey: string): Promise<any> {
        return Promise.resolve(undefined);
    }



}
