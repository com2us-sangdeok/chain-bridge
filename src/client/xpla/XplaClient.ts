import { Client } from "../Client";
import { BlockchainClient } from "../../blockchain-client";
import { XplaConnectionOptions } from "./XplaConnectionOptions";
import { ClientPackageNotInstalledError } from "../../error";
import { Account } from "../type";
import { ChainBridgeError } from "../../error";
import { XplaCreateTxData, XplaFeeConfig, XplaTxFee } from "./XplaType";
import { AccountState, Block, Transaction } from "../../type";
import { Connection } from "../Connection";
import { SignerOptions, Wallet, Fee, hashToHex, LCDClient, Msg, SignerData, SignOptions } from "@xpla/xpla.js";
import { Tx } from "@xpla/xpla.js/dist/core";
import { Balance } from "../../type/Balance";

export class XplaClient extends Connection implements Client {
  // -------------------------------------------------------------------------
  // Protected Properties
  // -------------------------------------------------------------------------
  override provider: LCDClient;

  /**
   * Connection used by client.
   */
  // connection: BlockchainClient

  /**
   * Xpla underlying library.
   */
  // xpla: any

  // lcd: LCDClient

  // chainID: string | undefined

  // -------------------------------------------------------------------------
  // Public Implemented Properties
  // -------------------------------------------------------------------------

  /**
   * Connection options.
   */

  // options: XplaConnectionOptions

  /**
   * Master database used to perform all write queries.
   */
  // blockchain?: string

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------
  constructor(readonly connection: BlockchainClient) {
    // this.connection = connection
    // this.options = {
    //   ...connection.options,
    // } as XplaConnectionOptions
    //
    // // load xpla package
    // this.loadDependencies()
    super(connection.options as XplaConnectionOptions);
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  protected override loadDependencies(): void {
    try {
      // const xpla = this.options.client || PlatformTools.load("xpla")
      // this.xpla = xpla
      // this.lcd = new this.xpla.LCDClient({
      //   URL: this.options.nodeURL,
      //   chainID: this.options.chainID,
      // })
      // this.chainID = this.options.chainID
      super.loadDependencies();
      this.provider = new this.library.LCDClient({
        URL: this.options.nodeURL,
        chainID: this.options.chainID,
      });
    } catch (e) {
      if (e instanceof ClientPackageNotInstalledError) {
        throw new ClientPackageNotInstalledError(
          "Xpla",
          "@xpla/xpla.js",
        )
      } else {
        // TODO TBD error type
        throw new ChainBridgeError("Provider Error");
      }
    }
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------
  getProvider(): LCDClient {
    return this.provider;
  }

  async getBalance(address: string): Promise<Balance> {
    const balances = await this.provider.bank.balance(address);
    const balance = balances[0].get("axpla")?.amount.toString() ?? "0";
    return {
      value: BigInt(balance),
      decimals: 18,
    };
  }

  async getAccountState(address: string): Promise<AccountState> {
    const accountInfo = await this.provider.auth.accountInfo(address);
    return {
      nonce: accountInfo.getSequenceNumber(),
      accountNumber: accountInfo.getAccountNumber(),
      publicKey: accountInfo.getPublicKey()?.pubkeyAddress(),
    };
  }

  async getBlock(blockNumber?: number): Promise<Block> {
    const blockInfo = await this.provider.tendermint.blockInfo(blockNumber);
    return {
      number: Number(blockInfo.block.header.height),
      hash: Buffer.from(blockInfo.block_id.hash, "base64").toString("hex"),
      miner: blockInfo.block.header.proposer_address, // TODO
      timestamp: blockInfo.block.header.time,
      txs: blockInfo.block.data.txs?.map((tx) => hashToHex(tx))!
    };
  }

  async getTx(txhash: string): Promise<Transaction> {
    const txInfo = await this.provider.tx.txInfo(txhash);
    return {
      txhash: txInfo.txhash,
      blockNumber: txInfo.height,
      status: txInfo.code == 0 ? "success" : "fail",
      fee: {
        gasUsed: txInfo.gas_used,
        gasWanted: txInfo.gas_wanted,
        fee: txInfo.tx.auth_info.fee.toData()
      } as XplaTxFee,
      data: txInfo.tx.body.toData(),
      logs: txInfo.logs?.map(value => value.toData())!
    };
  }

  async createTx(txOptions: XplaCreateTxData, encoded: boolean = false): Promise<any> {
    const { signers, ...createTxOptions } = txOptions;
    const onlyAddress: SignerOptions[] = signers.map(value => {
      return { address: value.address };
    });
    const unsignedTx = await this.provider.tx.create(onlyAddress, createTxOptions);

    // add fake signer info for custom sequence
    unsignedTx.appendEmptySignatures(
      signers
        .filter(value => value.sequenceNumber != null)
        .map(value => value as SignerData)
    );

    // remove empty signature
    unsignedTx.signatures = unsignedTx.signatures.filter(value => value != '');
    if(encoded) {
      return this.provider.tx.encode(unsignedTx);
    } else {
      return unsignedTx
    }
  }

  async sendSignedTx(signedTx: string): Promise<any> {
    return this.provider.tx.broadcast(this.provider.tx.decode(signedTx));
  }

  async sendSignedTxAsync(signedTx: string): Promise<string> {
    const result = await this.provider.tx.broadcastAsync(this.provider.tx.decode(signedTx));
    return result.txhash;
  }

  // fixme: add isClassic value into signTx fn
  async signTx(unsignedTx: any, mnemonic: string): Promise<string> {
    let decodedTx: Tx;
    if(typeof unsignedTx ==='object') {
      decodedTx = unsignedTx;
    } else {
      decodedTx = this.provider.tx.decode(unsignedTx);
    }
    const emptySignIndex = decodedTx.auth_info.signer_infos.findIndex(value => value.sequence != null);

    const wallet = new this.library.MnemonicKey({ mnemonic: mnemonic });
    const accountState = await this.getAccountState(wallet.accAddress);

    if (emptySignIndex != -1) {
      accountState.nonce = decodedTx.auth_info.signer_infos[emptySignIndex].sequence;
      decodedTx.auth_info.signer_infos.splice(emptySignIndex, 1);
    }

    const signOptions: SignOptions = {
      chainID: this.options.chainID!,
      accountNumber: accountState.accountNumber!,
      sequence: accountState.nonce,
      signMode: 127, //exSignMode.SIGN_MODE_LEGACY_AMINO_JSON
    };

    const signedTx = await wallet.signTx(decodedTx, signOptions);
    return this.provider.tx.encode(signedTx);
  }

  async estimateFee(txOptions: XplaCreateTxData): Promise<XplaFeeConfig> {
    const { signers, ...createTxOptions } = txOptions;

    const signerDatas: SignerData[] = [];

    for (const signer of signers) {
      const accountInfo = await this.provider.auth.accountInfo(signer.address);
      signerDatas.push({
        sequenceNumber: accountInfo.getSequenceNumber(),
        publicKey: accountInfo.getPublicKey(),
      });
    }

    createTxOptions.gasAdjustment = createTxOptions.gasAdjustment ?? 1.5;

    return {
      gas: createTxOptions.gasPrices || this.provider.config.gasPrices,
      fee: (await this.provider.tx.estimateFee(signerDatas, createTxOptions)).toData(),
      gasAdjustment: createTxOptions.gasAdjustment
    };
  }

  async contractQuery(contract: string, query: object | string): Promise<any> {
    return this.provider.wasm.contractQuery(contract, query);
  }

  public createAccount(mnemonic?: string): Account {
    const mk = new this.library.MnemonicKey({
      mnemonic: mnemonic,
    })

    return {
      address: mk.accAddress,
      publicKey: mk.publicKey.key,
      privateKey: mk.mnemonic,
    };
  }

  // -------------------------------------------------------------------------
  // Deprecated Methods
  // -------------------------------------------------------------------------

  getLcdClient(): any {
    return this.provider;
  }

  getSequence(wallet: Wallet): Promise<number> {
    return wallet.sequence()
  }

  async getFee(msgs: Msg[], feePayer: string, signerList: string[]): Promise<Fee> {
    const signers = []

    for (const signer of signerList) {
      const accountInfo = await this.provider.auth.accountInfo(signer);

      signers.push({
        sequenceNumber: accountInfo.getSequenceNumber(),
        publicKey: accountInfo.getPublicKey(),
      });
    }

    const estimateFee = await this.provider.tx.estimateFee(signers,
      {
        msgs: msgs,
        gasAdjustment: 1.5,
      },
    )

    return new Fee(estimateFee.gas_limit, estimateFee.amount.toString(), feePayer)
  }

  decodeTx(encodedTx: string): any {
    // return this.lcd.tx.decodeTx(encodedTx)
  }

  encodeTx(tx: any): string {
    // return this.lcd.tx.encodeTx(tx)
    return "";
  }

  // only for xpla
  wallet(mnemonic: string): any {
    const mk = new this.library.MnemonicKey({
      mnemonic: mnemonic,
    })

    return this.provider.wallet(mk)
  }

  getAccountNumber(wallet: any): Promise<number> {
    return wallet.accountNumber()
  }

  account(address: string): Promise<any> {
    return this.provider.auth.accountInfo(address)
  }
}
