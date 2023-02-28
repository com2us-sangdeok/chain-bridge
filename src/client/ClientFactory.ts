import { BlockchainClient } from "../blockchain-client";
import { Client } from "./Client";
import { TerraClient } from "./terra/TerraClient";
import { XplaClient } from "./xpla/XplaClient";
import { MissingClientError } from "../error/MissingClientError";
import {EthereumClient} from "./ethereum/EthereumClient";

export class ClientFactory {
  /**
   * Creates a new client depend on a given blockchain client type.
   */
  create(connection: BlockchainClient): Client {
    const {type} = connection.options
    switch (type) {
      case "ethereum":
        return new EthereumClient(connection)
      case "terra":
        return new TerraClient(connection)
      case "xpla":
        return new XplaClient(connection)
      default:
        throw new MissingClientError(type, [
          "ethereum",
          "terra",
          "xpla",
        ])
    }
  }
}
