
import {BlockchainClient} from "../blockchain-client";
import {Client} from "./Client";
import {TerraClient} from "./terra/TerraClient";
import {MissingClientError} from "../error/MissingClientError";

/**
 * Helps to create drivers.
 */
export class ClientFactory {
    /**
     * Creates a new driver depend on a given connection's driver type.
     */
    create(connection: BlockchainClient): Client {
        const { type } = connection.options
        switch (type) {
            case "terra":
                return new TerraClient(connection)
            default:
                throw new MissingClientError(type, [
                    "ethereum",
                    "terra",
                ])
        }
    }
}
