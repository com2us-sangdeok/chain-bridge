import { PlatformTools } from "../../platform/PlatformTools"
import { Client } from "../Client";
import { BlockchainClient } from "../../blockchain-client";
import { XplaConnectionOptions } from "./XplaConnectionOptions";
import { ClientPackageNotInstalledError } from "../../error/ClientPackageNotInstalledError";
import { Account } from "../type/Account";
import { ChainBridgeError } from "../../error/ChainBridgeError";
import { Wallet } from "@xpla/xpla.js/dist/client/lcd/Wallet";
import { CreateTxOptions, Fee, LCDClient as LCDXpla, Msg } from "@xpla/xpla.js";

export class XplaClient implements Client {
  // -------------------------------------------------------------------------
  // Public Properties
  // -------------------------------------------------------------------------

  /**
   * Connection used by client.
   */
  connection: BlockchainClient

  /**
   * Xpla underlying library.
   */
  xpla: any

  lcd: any

  chainID: string | undefined

  // -------------------------------------------------------------------------
  // Public Implemented Properties
  // -------------------------------------------------------------------------

  /**
   * Connection options.
   */
  options: XplaConnectionOptions

  /**
   * Master database used to perform all write queries.
   */
  blockchain?: string

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------
  constructor(connection: BlockchainClient) {
    this.connection = connection
    this.options = {
      ...connection.options,
    } as XplaConnectionOptions

    // load xpla package
    this.loadDependencies()
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  public getLcdClient(): LCDXpla {
    return this.lcd
  }

  public async getBalance(address: string): Promise<any> {

    // let balance: [Coins, Pagination]
    let balance = [];
    try {
      balance = (await this.lcd.bank.balance(address))[0].toData()
    } catch (e) {
      balance = []
    }

    return balance

  }

  public createAccount(mnemonic: string): Account {

    const mk = new this.xpla.MnemonicKey({
      mnemonic: mnemonic,
    })

    const account: Account = {
      address: mk.accAddress,
      publicKey: mk.publicKey.key,
      privateKey: mk.mnemonic,
    }

    try {
      this.lcd.wallet(mk)
    } catch (e) {
      throw new ChainBridgeError(`error occurred while creating an account.`)
    }

    return account
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  getSequence(wallet: Wallet): Promise<number> {
    return wallet.sequence()
  }

  createTx(options: CreateTxOptions, address: any): Promise<any> {
    return this.lcd.tx.create(address, options)
  }

  // fixme: add isClassic value into signTx fn
  async signTx(unsignedTx: any, signData: any): Promise<any> {
    const userSignOption = {
      chainID: this.chainID,
      accountNumber: await signData.accountNumber(),
      sequence: await signData.sequence(),
      signMode: 127,//exSignMode.SIGN_MODE_LEGACY_AMINO_JSON
    }
    return signData.key.signTx(unsignedTx, userSignOption)
  }

  // todo: check broadcastAsync, broadcastSync
  sendSignedTx(signedTx: any): Promise<any> {
    return this.lcd.tx.broadcast(signedTx)
  }

  getTx(txhash: string): Promise<any> {
    return this.lcd.tx.txInfo(txhash)
  }

  async getFee(msgs: Msg[], feePayer: string, signerList: string[]): Promise<Fee> {
    const signers = []

    for (const signer of signerList) {
      const accountInfo = await this.lcd.auth.accountInfo(signer);

      signers.push({
        sequenceNumber: accountInfo.getSequenceNumber(),
        publicKey: accountInfo.getPublicKey(),
      });
    }

    const estimateFee = await this.lcd.tx.estimateFee(signers,
      {
        msgs: msgs,
        gasAdjustment: 1.5,
      },
    )

    return new Fee(estimateFee.gas_limit, estimateFee.amount.toString(), feePayer)
  }

  decodeTx(encodedTx: string): any {
    return this.lcd.tx.decodeTx(encodedTx)
  }

  encodeTx(tx: any): string {
    return this.lcd.tx.encodeTx(tx)
  }

  contractQuery(contractAddress: string, query: any): Promise<any> {
    return this.lcd.wasm.contractQuery(contractAddress, query)
  }

  // only for xpla
  wallet(mnemonic: string): any {
    const mk = new this.xpla.MnemonicKey({
      mnemonic: mnemonic,
    })

    return this.lcd.wallet(mk)
  }

  getAccountNumber(wallet: any): Promise<number> {
    return wallet.accountNumber()
  }

  account(address: string): Promise<any> {
    return this.lcd.auth.accountInfo(address)
  }

  protected loadDependencies(): void {
    try {
      const xpla = this.options.client || PlatformTools.load("xpla")
      this.xpla = xpla
      this.lcd = new this.xpla.LCDClient({
        URL: this.options.nodeURL,
        chainID: this.options.chainID,
      })
      this.chainID = this.options.chainID
    } catch (e) {
      throw new ClientPackageNotInstalledError(
        "Xpla",
        "xpla",
      )
    }
  }

}
