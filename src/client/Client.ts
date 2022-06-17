import {BaseBlockchainClientOptions} from "../blockchain-client/BaseBlockchainClientOptions";

export type ReturningType = "insert" | "update" | "delete"

/**
 * Driver organizes TypeORM communication with specific database management system.
 */
export interface Client {
    /**
     * Connection options.
     */
    options: BaseBlockchainClientOptions

    /**
     * Database name used to perform all write queries.
     *
     * todo: probably move into query runner.
     */
    blockchain?: string

    /**
     * Performs connection to the database.
     * Depend on driver type it may create a connection pool.
     */
    connect(): Promise<void>
}
