/**
 * DataSource is a pre-defined connection configuration to a specific database.
 * You can have multiple data sources connected (with multiple connections in it),
 * connected to multiple databases in your application.
 *
 * Before, it was called `Connection`, but now `Connection` is deprecated
 * because `Connection` isn't the best name for what it's actually is.
 */
import {BlockchainClientOptions} from "./BlockchainClientOptions";
import {Client} from "../client/Client";
import {ClientFactory} from "../client/ClientFactory";

export class BlockchainClient {
    // readonly "@instanceof" = Symbol.for("BlockchainClient")

    // -------------------------------------------------------------------------
    // Public Readonly Properties
    // -------------------------------------------------------------------------

    /**
     * Connection options.
     */
    readonly options: BlockchainClientOptions

    /**
     * Database client used by this connection.
     */
    client: Client


    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(options: BlockchainClientOptions) {
        this.options = options
        this.client = new ClientFactory().create(this)
    }


}
