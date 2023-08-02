import { BlockchainClientOptions } from "./BlockchainClientOptions";
import { Client } from "../client/Client";
import { ClientFactory } from "../client/ClientFactory";

export class BlockchainClient {
  // readonly "@instanceof" = Symbol.for("BlockchainClient")

  readonly options: BlockchainClientOptions

  /**
   * Blockchain client
   */
  client: Client

  constructor(options: BlockchainClientOptions) {
    this.options = options
    this.client = new ClientFactory().create(this)
  }


}
