export interface Block {
  number: number;
  hash: string;
  miner: string;
  txs: string[];
  timestamp: number | string;
}