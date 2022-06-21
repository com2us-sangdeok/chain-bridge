import { PlatformTools } from "../../platform/PlatformTools"
import {Client} from "../Client";
import {BlockchainClient} from "../../blockchain-client";
import {TerraConnectionOptions} from "./TerraConnectionOptions";
import {ClientPackageNotInstalledError} from "../../error/ClientPackageNotInstalledError";

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
    // Public Methods
    // -------------------------------------------------------------------------
    async accountInfo(address: string): Promise<any> {
        return this.lcd.auth.accountInfo(address)
    }

    /**
     * Creates an account.
     */
    public createAccount(mnemonic: string): Promise<any> {
        const mk = new this.terra.MnemonicKey({
            mnemonic: mnemonic,
        });

        console.log('accAddress: ', mk.accAddress)
        console.log('publicKey: ', mk.publicKey)
        console.log('mnemonic: ', mk.mnemonic)

        return this.lcd.wallet(mk);
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Loads all client dependencies.
     */
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

}
