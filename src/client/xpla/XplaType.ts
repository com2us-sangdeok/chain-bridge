import { Coins, Fee, Numeric, TxBody, TxLog } from "@xpla/xpla.js";
import { CreateTxOptions, SignerOptions } from "@xpla/xpla.js/dist/client/lcd/api/TxAPI";

export interface XplaFeeConfig {
  gas?: Coins.Input;
  gasAdjustment: Numeric.Input;
  fee: Fee.Data;
}

export interface XplaTxFee extends XplaFeeConfig {
  gasWanted: number;
  gasUsed: number;
}

export interface XplaTxData extends TxBody.Data {
}

export interface XplaTxLog extends TxLog.Data {
}

export interface XplaTxSignature {
}

export interface XplaCreateTxData extends CreateTxOptions {
  // Required to create empty signature during #estimateFee
  // signers: { address: string }[];
  signers: SignerOptions[];
}