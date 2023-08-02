import { Log, TransactionConfig } from "web3-core";

export interface EthereumFeeConfig {
  gas: number;
  gasPrice: number;
  maxFeePerGas?: number;
  maxPriorityFeePerGas?: number;
}

export interface EthereumTxFee extends EthereumFeeConfig {
  gasUsed: number;
}

export interface EthereumTxData {
  from: string;
  to: string;
  value: string;
  input: string;
}

export interface EthereumTxLog extends Log {
}

export interface EthereumTxSignature {
}

export interface EthereumCreateTxData extends TransactionConfig {
  // chainId?: number | any;
}
