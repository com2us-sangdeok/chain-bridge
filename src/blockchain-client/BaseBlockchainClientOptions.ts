import { BlockchainType } from "../type/BlockchainType";

export interface BaseBlockchainClientOptions {
  readonly type: BlockchainType
  readonly nodeURL?: string
  readonly chainID?: string
}
