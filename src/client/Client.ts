import { Account, AccountState, Block, CreateTxData, FeeConfig, Transaction } from "../type";
import { Balance } from "../type/Balance";

export interface Client {
  // /**
  //  * Connection options.
  //  */
  // options: BaseBlockchainClientOptions
  // blockchain?: string

  getBalance(address: string): Promise<Balance>

  getAccountState(address: string): Promise<AccountState>

  getBlock(blockNumber?: number): Promise<Block>;

  getTx(txhash: string): Promise<Transaction>

  createTx(txOptions: CreateTxData, encoded?: boolean): Promise<any>

  signTx(unsignedTx: any, mnemonicOrPrivateKey: string): Promise<string>

  // wait for its inclusion in a block
  sendSignedTx(transaction: any): Promise<any>

  // returns immediately (transaction might fail)
  sendSignedTxAsync(transaction: any): Promise<string>

  estimateFee(txOptions: CreateTxData): Promise<FeeConfig>

  contractQuery(contract: string, query: any): Promise<any> //for view, queries

  getProvider(): any

  createAccount(privateKey?: string): Account
}

export interface Client {
  /**
   *
   * @deprecated Use instead of getAccountState
   */
  getSequence(wallet: any): Promise<number>

  /**
   *
   * @deprecated Use instead of estimateFee
   */
  getFee(tx: any, feePayer: any, signerList?: string[]): any

  /**
   *
   * @deprecated
   */
  encodeTx(tx: any): string

  /**
   *
   * @deprecated
   */
  decodeTx(encodedTx: string): any

  /**
   *
   * @deprecated
   */
  // only for xpla | terra
  wallet(mnemonic: string): any

  /**
   *
   * @deprecated Use 'getAccountState' method instead
   */
  getAccountNumber(wallet: any): Promise<number>

  /**
   *
   * @deprecated
   */
  account(address: string): Promise<any>

  // getLcdClient(): LCDTerra | LCDXpla
  /**
   *
   * @deprecated Use 'getProvider' method instead
   */
  getLcdClient(): any
}
