import { BlockchainClient } from "../blockchain-client";
import { Client } from "./Client";
import { XplaClient } from "./xpla/XplaClient";
import { MissingClientError } from "../error/MissingClientError";
import { EthereumClient } from "./ethereum/EthereumClient";

export class ClientFactory {
  /**
   * Creates a new client depend on a given blockchain client type.
   */
  create(connection: BlockchainClient): Client {
    const { type } = connection.options
    switch (type) {
      case "xpla":
        return new XplaClient(connection)
      case "ethereum":
      case "polygon":
        return new EthereumClient(connection)

      default:
        throw new MissingClientError(type, [
          "ethereum",
          "polygon",
          "terra",
          "xpla",
        ])
    }
  }
}
