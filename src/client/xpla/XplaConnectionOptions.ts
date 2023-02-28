/**
 * Xpla-specific xpla options.
 */
import { BaseBlockchainClientOptions } from "../../blockchain-client/BaseBlockchainClientOptions";
import { XplaClientConfig } from "./XplaClientConfig";

export interface XplaConnectionOptions
  extends BaseBlockchainClientOptions,
    XplaClientConfig {

  readonly type: "xpla"
  readonly client?: any
}
