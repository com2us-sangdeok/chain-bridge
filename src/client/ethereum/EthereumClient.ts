import { Client } from "../Client";
import { BlockchainClient } from "../../blockchain-client";
import { Account, AccountState, Block, Transaction } from "../../type";
import { EthereumCreateTxData, EthereumFeeConfig, EthereumTxData, EthereumTxFee, EthereumTxLog } from "./EthereumType";
import { Connection } from "../Connection";
import { ChainBridgeError, ClientPackageNotInstalledError } from "../../error";
import { EthereumConnectionOptions } from "./EthereumConnectionOptions";
import Web3 from "web3";
import { TransactionFactory } from "@ethereumjs/tx";
import { Balance } from "../../type/Balance";

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
      this.provider = new this.library(this.options.nodeURL);
    } catch (e) {
      if (e instanceof ClientPackageNotInstalledError) {
        throw new ClientPackageNotInstalledError(
          "Web3",
          "web3",
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
    const nonce = await this.provider.eth.getTransactionCount(address);
    return {
      nonce: nonce
    };
  }

  async getBlock(blockNumber?: number): Promise<Block> {
    const block = await this.provider.eth.getBlock(blockNumber ?? "latest");
    return {
      number: block.number,
      hash: block.hash,
      miner: block.miner,
      timestamp: block.timestamp,
      txs: block.transactions
    };
  }

  async getTx(txhash: string): Promise<Transaction> {
    const [tx, receipt] = await Promise.all([
      this.provider.eth.getTransaction(txhash),
      this.provider.eth.getTransactionReceipt(txhash)
    ]);

    return {
      txhash: tx.hash,
      blockNumber: tx.blockNumber!,
      status: receipt.status ? "success" : "fail",
      fee: {
        gas: tx.gas,
        gasPrice: Number(tx.gasPrice),
        maxFeePerGas: tx.maxFeePerGas,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        gasUsed: receipt.gasUsed
      } as EthereumTxFee,
      data: {
        from: tx.from,
        to: tx.to,
        value: tx.value,
        input: tx.input
      } as EthereumTxData,
      logs: <EthereumTxLog[]>receipt.logs
    };
  }

  async createTx(txOptions: EthereumCreateTxData, encoded: boolean = false): Promise<any> {
    if (txOptions.nonce == null && txOptions.from != null) {
      txOptions.nonce = await this.provider.eth.getTransactionCount(<string>txOptions.from);
    }

    txOptions.chainId = Number(this.options.chainID)

    const estimatedFee = await this.estimateFee(txOptions);
    txOptions.gas = txOptions.gas ?? estimatedFee.gas; // gas limit

    const typedOptions = { type: 0, gasLimit: txOptions.gas };
    if(txOptions.gasPrice == null) {
      // EIP1559 Transaction
      txOptions.maxFeePerGas = txOptions.maxFeePerGas ?? estimatedFee.maxFeePerGas;
      txOptions.maxPriorityFeePerGas = txOptions.maxPriorityFeePerGas ?? estimatedFee.maxPriorityFeePerGas;
      typedOptions.type = 2;
    }

    if(encoded) {
      return TransactionFactory.fromTxData({...txOptions, ...typedOptions}).serialize().toString('hex');
    } else {
      return txOptions;
    }
  }

  async sendSignedTx(signedTx: string): Promise<any> {
    return this.provider.eth.sendSignedTransaction(signedTx)
  }

  async sendSignedTxAsync(signedTx: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.provider.eth.sendSignedTransaction(signedTx)
        .on("transactionHash", (hash) => {
          resolve(hash);
        }).catch(e => {
          reject(e)
        });
    });
  }

  async signTx(unsignedTx: any, privateKey: string): Promise<string> {
    if(typeof unsignedTx === 'object') {
      const signedTx = await this.provider.eth.accounts.signTransaction(unsignedTx, privateKey);
      return signedTx.rawTransaction!;
    }
    else {
      const decodedTx = TransactionFactory.fromSerializedData(Buffer.from(unsignedTx, 'hex'));
      return `0x${decodedTx.sign(Buffer.from(privateKey, 'hex')).serialize().toString('hex')}`;
    }
  }

  async estimateFee(txOptions: EthereumCreateTxData): Promise<EthereumFeeConfig> {
    const [gas, gasPrice, feeHistory] = await Promise.all([
      this.provider.eth.estimateGas({
        ...txOptions,
        chainId: undefined
        // chainId: !txOptions.chainId?.startsWith('0x') ? this.provider.utils.toHex(txOptions.chainId) as any : txOptions.chainId
      }),
      this.provider.eth.getGasPrice(),
      this.provider.eth.getFeeHistory(4, 'latest', [25])
    ]);
    const baseFeePerGas = Web3.utils.toNumber(feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 1]);
    const rewards = feeHistory.reward.map((value: string[]) => Web3.utils.toNumber(value[0])).filter((value: number) => value != 0);
    const priorityFeePerGas = Math.round(rewards.reduce((a: number, b: number) => a + b, 0) / rewards.length);
    return {
      gas: Math.ceil(gas * 1.5),
      gasPrice: Math.ceil(Number(gasPrice) * 1.5),
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

  public createAccount(privateKey?: string): Account {
    let account;
    if (privateKey == null) {
      account = this.provider.eth.accounts.create();
    } else {
      account = this.provider.eth.accounts.privateKeyToAccount(privateKey);
    }

    return {
      address: account.address,
      privateKey: account.privateKey
    };
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

  decodeTx(encodedTx: string): any {
    return Promise.resolve(0);
  }

  encodeTx(tx: any): string {
    return "";
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
