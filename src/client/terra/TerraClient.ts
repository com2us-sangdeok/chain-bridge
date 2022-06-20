import { PlatformTools } from "../../platform/PlatformTools"
import {Client} from "../Client";
import {BlockchainClient} from "../../blockchain-client";
import {TerraConnectionOptions} from "./TerraConnectionOptions";
import {ClientPackageNotInstalledError} from "../../error/ClientPackageNotInstalledError";

/**
 * Organizes communication with MySQL DBMS.
 */
export class TerraClient implements Client {
    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    /**
     * Connection used by driver.
     */
    connection: BlockchainClient

    /**
     * Mysql underlying library.
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

    /**
     * Performs connection to the database.
     */
    async connect(): Promise<void> {
        if (!this.blockchain) {
        }
    }

    async accountInfo(address: string): Promise<void> {
        return this.terra.auth.accountInfo(address)
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
            this.lcd = this.terra.LCDClient({
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

    /**
     * Creates an account.
     */
    public createAccount(mnemonic: string): Promise<any> {
        const mk = new this.terra.MnemonicKey({
            mnemonic: mnemonic,
        });
        return this.lcd.wallet(mk);
    }
    // protected createPool(connectionOptions: any): Promise<any> {
    //     // create a connection pool
    //     const pool = this.mysql.createPool(connectionOptions)
    //
    //     // make sure connection is working fine
    //     return new Promise<void>((ok, fail) => {
    //         // (issue #610) we make first connection to database to make sure if connection credentials are wrong
    //         // we give error before calling any other method that creates actual query runner
    //         pool.getConnection((err: any, connection: any) => {
    //             if (err) return pool.end(() => fail(err))
    //
    //             connection.release()
    //             ok(pool)
    //         })
    //     })
    // }
}
