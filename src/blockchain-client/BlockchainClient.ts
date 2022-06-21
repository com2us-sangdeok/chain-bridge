import {BlockchainClientOptions} from "./BlockchainClientOptions";
import {Client} from "../client/Client";
import {ClientFactory} from "../client/ClientFactory";

export class BlockchainClient {
    // readonly "@instanceof" = Symbol.for("BlockchainClient")

    /**
     * Public Readonly Properties
     * Connection options.
     */
    readonly options: BlockchainClientOptions

    /**
     * Blockchain client used by this terra.
     */
    client: Client

    constructor(options: BlockchainClientOptions) {
        this.options = options
        this.client = new ClientFactory().create(this)
    }


}
