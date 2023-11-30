import { Log, Transaction } from "web3"; // web3-types/eth_types

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

export interface EthereumCreateTxData extends Transaction {
  // chainId?: number | any;
}
