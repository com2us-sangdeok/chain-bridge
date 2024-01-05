import { Client } from "../Client";
import { BlockchainClient } from "../../blockchain-client";
import { XplaConnectionOptions } from "./XplaConnectionOptions";
import { ClientPackageNotInstalledError } from "../../error";
import { ChainBridgeError } from "../../error";
import { XplaCreateTxData, XplaFeeConfig, XplaTxFee } from "./XplaType";
import { Account, AccountState, Block, Transaction, TransactionResult } from "../../type";
import { Connection } from "../Connection";
import {
  SignerOptions,
  Wallet,
  Fee,
  hashToHex,
  LCDClient,
  Msg,
  SignerData,
  SignOptions, SignDoc, SimplePublicKey
} from "@xpla/xpla.js";
import { Tx } from "@xpla/xpla.js/dist/core";
import { Balance } from "../../type/Balance";
import * as bip39 from "bip39";
import { Signer } from "../../signer";
import { XplaSignerKey } from "./XplaSingerKey";
import { TransactionError } from "../../error/TransactionError";
import { XplaErrorCode } from "./XplaErrorCode";

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
      status: txInfo.code == 0 ? "success" : "failure",
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

  private checkBeforeSendTx(signedTx: string) {
    let isSigned = true;
    try {
      const decodeTx = this.decodeTx(signedTx);
      if(!decodeTx.signatures || decodeTx.signatures.length == 0) {
        isSigned = false;
      }
    } catch (e) {
      throw new TransactionError(TransactionError.ErrTxDecode)
    }

    if(!isSigned) {
      throw new TransactionError(TransactionError.ErrNoSignatures)
    }
  }

  async sendSignedTx(signedTx: string): Promise<TransactionResult> {
    this.checkBeforeSendTx(signedTx);

    const result: any = await this.provider.tx.broadcast(this.provider.tx.decode(signedTx));

    if (result.code > 0 && result.height == 0) {
      // 실패, 블록 마이닝 X
      throw new TransactionError(!!result.raw_log ? result.raw_log : XplaErrorCode[result.code]);
    }

    return {
      txhash: result.txhash,
      status: result.code == 0 ? "success" : "failure",
      ...(result.code != 0 && { rawLog: !!result.raw_log ? result.raw_log : XplaErrorCode[result.code] }),
    };
  }

  async sendSignedTxAsync(signedTx: string): Promise<TransactionResult> {
    this.checkBeforeSendTx(signedTx);

    const result = await this.provider.tx.broadcastAsync(this.provider.tx.decode(signedTx));
    return {
      txhash: result.txhash,
      status: "pending",
    };
  }

  async signTx(unsignedTx: any, signer: Signer): Promise<string> {
    let decodedTx: Tx;
    if(typeof unsignedTx ==='object') {
      decodedTx = unsignedTx;
    } else {
      decodedTx = this.provider.tx.decode(unsignedTx);
    }
    const emptySignIndex = decodedTx.auth_info.signer_infos.findIndex(value => value.sequence != null);

    const publicKey = await signer.getPublicKey(true);
    const wallet = new XplaSignerKey(signer, publicKey);
    const accountState = await this.getAccountState(wallet.accAddress);

    if (emptySignIndex != -1) {
      accountState.nonce = decodedTx.auth_info.signer_infos[emptySignIndex].sequence;
      decodedTx.auth_info.signer_infos.splice(emptySignIndex, 1);
    }

    // For Multisig
    const senders = decodedTx.body.messages
      .filter((msg: any) => msg.from_address || msg.sender)
      .map((msg: any) => msg.from_address ?? msg.sender);
    if(senders && senders.length > 0) {
      const senderSet = new Set(senders);
      if(!senderSet.has(wallet.accAddress)) {
        for(let sender of senderSet) {
          const accountInfo = await this.provider.auth.accountInfo(sender);
          const pubKey = accountInfo.getPublicKey();
          if(!(pubKey instanceof SimplePublicKey)) {
            // Multisig or null
            const signInfo = await wallet.createSignatureAmino(new SignDoc(
              this.options.chainID!,
              accountInfo.getAccountNumber(),
              accountInfo.getSequenceNumber(),
              decodedTx.auth_info,
              decodedTx.body,
            ));
            const signature = JSON.stringify(signInfo.toData());
            console.log(signature)
            return Buffer.from(signature).toString('base64');
          }
        }
      }
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

  async signMsg(msg: string, signer: Signer): Promise<string> {
    // const msgBuffer = /^((-)?0x[0-9a-f]+|(0x))$/i.test(msg) ? Buffer.from(msg) : new TextEncoder().encode(msg);
    const publicKey = await signer.getPublicKey(true);
    const wallet = new XplaSignerKey(signer, publicKey);
    const signature = await wallet.sign(Buffer.from(msg))
    return Buffer.from(signature).toString('base64');
  }

  async getAddress(signer: Signer): Promise<string> {
    const publicKey = await signer.getPublicKey();
    const wallet = new XplaSignerKey(signer, publicKey);
    return wallet.accAddress;
  }

  // async signTx(unsignedTx: any, signer: Signer): Promise<string> {
  //   let tx: Tx;
  //   if(typeof unsignedTx ==='object') {
  //     tx = unsignedTx;
  //   } else {
  //     tx = this.provider.tx.decode(unsignedTx);
  //   }
  //
  //   const publicKey = new SimplePublicKey(Buffer.from(await signer.getPublicKey(true)).toString('base64'));
  //   const accountState = await this.getAccountState(publicKey.address());
  //
  //   const emptySignIndex = tx.auth_info.signer_infos.findIndex(value => value.sequence != null);
  //   if (emptySignIndex != -1) {
  //     accountState.nonce = tx.auth_info.signer_infos[emptySignIndex].sequence;
  //     tx.auth_info.signer_infos.splice(emptySignIndex, 1);
  //   }
  //
  //   const copyTx = new Tx(tx.body, new AuthInfo([], tx.auth_info.fee), []);
  //   const signDoc = new SignDoc(
  //     this.options.chainID!,
  //     accountState.accountNumber!,
  //     accountState.nonce,
  //     new AuthInfo([], tx.auth_info.fee),
  //     tx.body
  //   );
  //
  //   const msgToSign = Buffer.from(keccak256(Buffer.from(signDoc.toAminoJSON(false))).substring(2), 'hex');
  //   const signature = await signer.sign(msgToSign);
  //   const sigatureV2 = new SignatureV2(
  //     publicKey,
  //     new SignatureV2.Descriptor(
  //       new SignatureV2.Descriptor.Single(
  //         SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
  //         Buffer.from(signature).toString('base64')
  //       )
  //     ),
  //     accountState.nonce
  //   );
  //
  //   const sigData = sigatureV2.data.single as SignatureV2.Descriptor.Single;
  //   copyTx.signatures.push(...tx.signatures, sigData.signature);
  //   copyTx.auth_info.signer_infos.push(
  //     ...tx.auth_info.signer_infos,
  //     new SignerInfo(
  //       sigatureV2.public_key,
  //       sigatureV2.sequence,
  //       new ModeInfo(new ModeInfo.Single(sigData.mode))
  //     )
  //   );
  //
  //   return this.provider.tx.encode(copyTx);
  // }

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

  public createAccount(mnemonicOrPrivateKey?: string): Account {
    let mnemonic;

    if (mnemonicOrPrivateKey == null) {
      mnemonicOrPrivateKey = bip39.generateMnemonic(256); // default strength 128 (metamask)
    }

    let key;
    if(bip39.validateMnemonic(mnemonicOrPrivateKey)) {
      mnemonic = mnemonicOrPrivateKey;
      key = new this.library.MnemonicKey({
        mnemonic: mnemonic,
      });
    } else {
      key = new this.library.RawKey(Buffer.from(mnemonicOrPrivateKey, "base64"));
    }

    return {
      address: key.accAddress,
      publicKey: key.publicKey.key,
      privateKey: key.privateKey.toString("base64"),
      ...(mnemonic != null && { mnemonic: mnemonic }),
    };
  }

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------

  decodeTx(encodedTx: string): any {
    if(typeof encodedTx === 'object') {
      return encodedTx;
    }

    return this.provider.tx.decode(encodedTx);
  }

  encodeTx(tx: any): string {
    if(typeof tx === 'string') {
      return tx;
    }
    return this.provider.tx.encode(tx);
  }
  async isEOA(address: string): Promise<boolean> {
    return /([a-z0-9]{1,20}1[a-z0-9]{38}$)/.test(address);
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
