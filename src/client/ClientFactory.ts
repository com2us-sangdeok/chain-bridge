
import {BlockchainClient} from "../blockchain-client";
import {Client} from "./Client";
import {TerraClient} from "./terra/TerraClient";
import {MissingClientError} from "../error/MissingClientError";

export class ClientFactory {
    /**
     * Creates a new client depend on a given blockchain client type.
     */
    create(connection: BlockchainClient): Client {
        const { type } = connection.options
        switch (type) {
            case "terra":
                return new TerraClient(connection)

            // todo: EthereumClient ...

            default:
                throw new MissingClientError(type, [
                    "ethereum",
                    "terra",
                ])
        }
    }
}
