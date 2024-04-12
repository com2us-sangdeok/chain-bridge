import { Client } from "../Client";
import { BlockchainClient } from "../../blockchain-client";
import { Account, AccountState, Block, Transaction, TransactionResult } from "../../type";
import { EthereumCreateTxData, EthereumFeeConfig, EthereumTxData, EthereumTxFee, EthereumTxLog } from "./EthereumType";
import { Connection } from "../Connection";
import { ChainBridgeError, ClientPackageNotInstalledError } from "../../error";
import { EthereumConnectionOptions } from "./EthereumConnectionOptions";
import Web3, {
  FMT_BYTES,
  FMT_NUMBER,
  Transaction1559SignedAPI,
  TransactionLegacySignedAPI
} from "web3";
import { Balance } from "../../type/Balance";
import { TransactionFactory, TxData, TypedTransaction, ecrecover, Common, hashMessage } from "web3-eth-accounts";
import { sha3Raw } from "web3-utils";
import { isHexPrefixed } from "web3-validator";
import * as bip39 from "bip39";
import * as bip32 from "bip32";
import { Signer } from "../../signer";
import { TransactionError } from "../../error/TransactionError";

export class EthereumClient extends Connection implements Client {
  // -------------------------------------------------------------------------
  // Protected Properties
  // -------------------------------------------------------------------------
  override provider: Web3;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------
  constructor(readonly connection: BlockchainClient) {
    super(connection.options as EthereumConnectionOptions);
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------
  protected override loadDependencies(): void {
    try {
      super.loadDependencies();
      const { Web3 } = this.library;
      this.provider = new Web3(this.options.nodeURL);
    } catch (e) {
      if (e instanceof ClientPackageNotInstalledError) {
        throw new ClientPackageNotInstalledError(
          "Web3",
          "web3",
        )
      } else {
        console.log(e)
        // TODO TBD error type
        throw new ChainBridgeError("Provider Error");
      }
    }
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------
  getProvider(): Web3 {
    return this.provider;
  }

  async getBalance(address: string): Promise<Balance> {
    const balance = await this.provider.eth.getBalance(address);
    return {
      value: BigInt(balance),
      decimals: 18, // Fixed
    };
  }

  async getAccountState(address: string): Promise<AccountState> {
    const nonce = await this.provider.eth.getTransactionCount(address, undefined, { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX });
    return {
      nonce: nonce
    };
  }

  async getBlock(blockNumber?: number): Promise<Block> {
    const block = await this.provider.eth.getBlock(blockNumber ?? "latest", false, { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX });
    return {
      number: block.number,
      hash: block.hash as string,
      miner: block.miner,
      timestamp: block.timestamp,
      txs: block.transactions as string[]
    };
  }

  async getTx(txhash: string): Promise<Transaction> {
    const [tx, receipt] = await Promise.all([
      this.provider.eth.getTransaction(txhash, { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX }),
      this.provider.eth.getTransactionReceipt(txhash, { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX })
    ]);

    const txType = Web3.utils.toNumber(tx.type);

    let contractAddress = receipt.contractAddress;
    if (!contractAddress) {
      // ContractCreation(address) event signature
      const contractCreateLog = receipt.logs
        ?.find((log) => log.topics && log.topics.length == 2 &&
          Web3.utils.bytesToHex(log.topics[0]) === '0x4db17dd5e4732fb6da34a148104a592783ca119a1e7bb8829eba6cbadef0b511');
      if (contractCreateLog && contractCreateLog.topics) {
        contractAddress = Web3.utils.bytesToHex(`0x${contractCreateLog.topics[1].slice(-40)}`);
      }
    }

    return {
      txhash: tx.hash,
      blockNumber: Number(tx.blockNumber),
      status: receipt.status ? "success" : "failure",
      fee: {
        gas: Number(tx.gas),
        gasPrice: txType === 0 ? Number((tx as unknown as TransactionLegacySignedAPI).gasPrice) : null,
        maxFeePerGas: txType !== 0 ? Number((tx as unknown as Transaction1559SignedAPI).maxFeePerGas) : null,
        maxPriorityFeePerGas: txType !== 0 ? Number((tx as unknown as Transaction1559SignedAPI).maxPriorityFeePerGas) : null,
        gasUsed: receipt.gasUsed
      } as EthereumTxFee,
      data: {
        from: tx.from,
        to: tx.to,
        value: tx.value,
        input: tx.input
      } as EthereumTxData,
      logs: <EthereumTxLog[]>receipt.logs,
      ...(contractAddress && { contractAddress: contractAddress })
    };
  }

  async createTx(txOptions: EthereumCreateTxData, encoded: boolean = false): Promise<any> {
    if (txOptions.nonce == null && txOptions.from != null) {
      txOptions.nonce = await this.getAccountState(<string>txOptions.from).then(account => account.nonce);
    }

    txOptions.chainId = Number(this.options.chainID);

    const estimatedFee = await this.estimateFee(txOptions);
    // txOptions.gas = txOptions.gas ?? estimatedFee.gas; // gas limit
    txOptions.gasLimit = txOptions.gas ?? estimatedFee.gas

    if (txOptions.gasPrice == null) {
      // EIP1559 Transaction
      txOptions.maxFeePerGas = txOptions.maxFeePerGas ?? estimatedFee.maxFeePerGas;
      txOptions.maxPriorityFeePerGas = txOptions.maxPriorityFeePerGas ?? estimatedFee.maxPriorityFeePerGas;
      txOptions.type = 2;
    }

    if (encoded) {
      return Buffer.from(TransactionFactory.fromTxData(txOptions as TxData | TypedTransaction, { common: Common.custom({chainId: txOptions.chainId, networkId: txOptions.chainId })}).serialize()).toString('hex');
    } else {
      return txOptions;
    }
  }

  private checkBeforeSendTx(signedTx: string) {
    let isSigned = true;
    try {
      const decodeTx = this.decodeTx(signedTx);
      isSigned = decodeTx.isSigned();
    } catch (e) {
      throw new TransactionError(TransactionError.ErrTxDecode)
    }

    if(!isSigned) {
      throw new TransactionError(TransactionError.ErrNoSignatures)
    }
  }

  async sendSignedTx(signedTx: string): Promise<TransactionResult> {
    this.checkBeforeSendTx(signedTx);

    try {
      const result = await this.provider.eth.sendSignedTransaction(signedTx, { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX }, {checkRevertBeforeSending: false});
      return {
        txhash: result.transactionHash.toString(),
        status: result.status ? "success" : "failure",
        ...(!result.status && { rawLog: TransactionError.ErrFailedTx }),
      }
    } catch (e) {
      throw new TransactionError(e);
    }
  }

  async sendSignedTxAsync(signedTx: string): Promise<TransactionResult> {
    this.checkBeforeSendTx(signedTx);

    return new Promise((resolve, reject) => {
      this.provider.eth.sendSignedTransaction(signedTx)
        .on("transactionHash", (hash) => {
          resolve({ txhash: hash, status: "pending" });
        }).catch(e => {
        reject(e)
      });
    });
  }

  private _calculateSignature(msgHash: Uint8Array, expectedPublicKeyHash: string, signature: Uint8Array, recId = 27n): { r: Uint8Array, s: Uint8Array, v: bigint } {
    const r = signature.subarray(0, 32);
    const s = signature.subarray(32, 64);
    let v = recId;
    let recover = ecrecover(msgHash, v, r, s);
    let publicHash = sha3Raw(recover)

    if (expectedPublicKeyHash.toUpperCase() === publicHash.toUpperCase()) {
      return {
        r: r,
        s: s,
        v: v,
      }
    } else {
      if (v > 28n) throw new Error('Not found valid recover id');
      return this._calculateSignature(msgHash, expectedPublicKeyHash, signature, v + 1n);
    }
  }

  private _processSignature(unsignedTx: TypedTransaction, r: Uint8Array, s: Uint8Array, v: bigint): string {
    const jsonTx: any = unsignedTx.toJSON();
    jsonTx.r = this.provider.utils.bytesToHex(r);
    jsonTx.s = this.provider.utils.bytesToHex(s);
    jsonTx.v = unsignedTx.type > 0 ? (v - 27n) : v + 8n + unsignedTx.common.chainId() * 2n;
    jsonTx.type = unsignedTx.type;
    return `0x${Buffer.from(TransactionFactory.fromTxData(jsonTx).serialize()).toString('hex')}`;
  }

  protected async sign(digest: Uint8Array, signer: Signer): Promise<{r: Uint8Array, s: Uint8Array, v: bigint}> {
    const msgToSign = digest;
    const signature = await signer.sign(msgToSign);
    const publicKeyHash = sha3Raw((await signer.getPublicKey()).slice(1));
    return this._calculateSignature(msgToSign, publicKeyHash, signature);
  }

  async signTx(unsignedTx: any, signer: Signer): Promise<string> {
    let tx: TypedTransaction;
    if (typeof unsignedTx === 'object') {
      tx = TransactionFactory.fromTxData(unsignedTx);
    } else {
      tx = TransactionFactory.fromSerializedData(Buffer.from(unsignedTx, 'hex'));
    }

    const digest = tx.getMessageToSign();
    const { r, s, v } = await this.sign(digest, signer);

    return this._processSignature(tx, r, s, v);
  }

  async signMsg(msg: string, signer: Signer): Promise<string> {
    // The data will be UTF-8 HEX decoded and enveloped as follows
    //  : "\\x19Ethereum Signed Message:\\n" + message.length + message and hashed using keccak256.
    const digest = this.provider.utils.hexToBytes(hashMessage(msg));
    const { r, s, v } = await this.sign(digest, signer);

    const sigR = this.provider.utils.bytesToHex(r);
    const sigS = this.provider.utils.bytesToHex(s);
    const sigV = v.toString(16);

    return sigR + sigS.substring(2) + sigV;
  }

  async getAddress(signer: Signer): Promise<string> {
    const publicKey = await signer.getPublicKey();
    return `0x${this.provider.utils.keccak256(
      publicKey.slice(1, publicKey.length)
    ).slice(-40)}`;
  }

  async estimateFee(txOptions: EthereumCreateTxData): Promise<EthereumFeeConfig> {
    const [gas, gasPrice, feeHistory] = await Promise.all([
      this.provider.eth.estimateGas(txOptions, undefined, { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX }),
      this.provider.eth.getGasPrice({ number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX }),
      this.provider.eth.getFeeHistory(4, 'latest', [25], { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX })
    ]);
    const baseFeePerGasArr = feeHistory.baseFeePerGas as any;
    const baseFeePerGas = Web3.utils.toNumber((baseFeePerGasArr as number[])[baseFeePerGasArr.length - 1]) as number;
    const rewards = feeHistory.reward.map((value: number[]) => Web3.utils.toNumber(value[0]) as number).filter((value: number) => value != 0);
    let priorityFeePerGas = Math.round(rewards.reduce((a: number, b: number) => a + b, 0) / rewards.length);
    if (isNaN(priorityFeePerGas)) {
      priorityFeePerGas = 0;
    }

    return {
      gas: Math.ceil(gas * 1.5),
      gasPrice: Math.ceil(gasPrice * 1.5),
      maxFeePerGas: Math.ceil(baseFeePerGas * 1.5) + priorityFeePerGas,
      maxPriorityFeePerGas: priorityFeePerGas,
    };
  }

  async contractQuery(contract: string, query: string): Promise<any> {
    return this.provider.eth.call({
      to: contract,
      data: query,
    });
  }

  public createAccount(mnemonicOrPrivateKey?: string): Account {
    let mnemonic;
    let privateKey;

    if (mnemonicOrPrivateKey == null) {
      // account = this.provider.eth.accounts.create();
      mnemonicOrPrivateKey = bip39.generateMnemonic(); // default strength 128 (metamask)
    }

    if (bip39.validateMnemonic(mnemonicOrPrivateKey)) {
      // Mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonicOrPrivateKey);
      const node = bip32.fromSeed(seed);
      const wallet = node.derivePath("m/44'/60'/0'/0/0");
      mnemonic = mnemonicOrPrivateKey;
      privateKey = this.provider.utils.bytesToHex(Uint8Array.from(wallet.privateKey!))
    } else {
      // Private key
      privateKey = mnemonicOrPrivateKey;
    }
    const account = this.provider.eth.accounts.privateKeyToAccount(isHexPrefixed(privateKey) ? privateKey : `0x${privateKey}`);

    return {
      address: account.address,
      privateKey: account.privateKey,
      ...(mnemonic != null && { mnemonic: mnemonic }),
    };
  }

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------

  decodeTx(encodedTx: string): any {
    if (typeof encodedTx === 'object') {
      return encodedTx;
    }
    return TransactionFactory.fromSerializedData(
      Buffer.from(isHexPrefixed(encodedTx) ? encodedTx.slice(2) : encodedTx , 'hex')
    );
  }

  encodeTx(tx: any): string {
    if (typeof tx === 'string') {
      return tx;
    }
    return Buffer.from(TransactionFactory.fromTxData(tx as TxData | TypedTransaction).serialize()).toString('hex');
    ;
  }

  async isEOA(address: string): Promise<boolean> {
    let result = false;
    try {
      const code = await this.provider.eth.getCode(address);
      if (code === '0x') {
        result = true;
      }
    } finally {
      return result;
    }
  }

  generateKey(): string {
    return this.provider.eth.accounts.create().privateKey;
  }

  // -------------------------------------------------------------------------
  // Deprecated Methods
  // -------------------------------------------------------------------------
  getLcdClient(): any {
    return this.provider;
  }

  getSequence(address: string): Promise<number> {
    return Promise.resolve(0);
  }

  async getFee(tx: any, feePayer: any): Promise<any> {
    return Promise.resolve(0);
  }

  // only for terra
  wallet(mnemonic: string): any {
    return Promise.resolve(0);
  }

  getAccountNumber(wallet: any): Promise<number> {
    return Promise.resolve(0);
  }

  account(address: string): Promise<any> {
    return Promise.resolve(0);
  }
}
