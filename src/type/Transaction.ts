import { XplaCreateTxData, XplaTxData, XplaTxFee, XplaTxLog, XplaTxSignature } from "../client/xpla/XplaType";
import {
  EthereumCreateTxData,
  EthereumTxData,
  EthereumTxFee,
  EthereumTxLog,
  EthereumTxSignature
} from "../client/ethereum";

const txStatus = {
  pending: "pending",
  success: "success",
  failure: "failure"
} as const;
export type TxStatus = typeof txStatus[keyof typeof txStatus];

export type TxFee = EthereumTxFee | XplaTxFee;
export type TxData = EthereumTxData | XplaTxData;
export type TxLogs = EthereumTxLog | XplaTxLog;
export type TxSignature = EthereumTxSignature | XplaTxSignature;

export interface Transaction {
  txhash: string;
  blockNumber: number;
  status: TxStatus;
  fee: TxFee;
  data: TxData;
  logs: TxLogs[];
  signature?: TxSignature;
  contractAddress?: string;
}

export type CreateTxData = XplaCreateTxData | EthereumCreateTxData;

export interface TransactionResult {
  txhash: string;
  status: TxStatus;
  rawLog?: string;
}
