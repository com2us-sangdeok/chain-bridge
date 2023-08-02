import { BlockchainClientOptions } from "../blockchain-client";
import { PlatformTools } from "../platform/PlatformTools";
import { ClientPackageNotInstalledError } from "../error";

export abstract class Connection {

  /**
   * Connection options.
   */
  protected options: BlockchainClientOptions;

  /**
   * The underlying library.
   */
  protected library: any;

  /**
   * JSON-RPC or REST Provider using the underlying library.
   */
  protected provider: any;

  protected constructor(connectionOptions: BlockchainClientOptions) {
    this.options = connectionOptions;
    this.loadDependencies();
  }

  protected loadDependencies(): void {
    try {
      this.library = this.options.client || PlatformTools.load(this.options.type);
    } catch (e) {
      throw new ClientPackageNotInstalledError(
        "unknown", "unknown",
      )
    }
  }
}

