import { ChainBridgeError } from "./ChainBridgeError";

export class TransactionError extends ChainBridgeError {

  static ErrInvalidTx = "invalid transaction";
  static ErrTxDecode = "tx parse error";
  static ErrNoSignatures = "no signatures supplied";
  static ErrFailedTx = 'failed transaction';
  constructor(msg?: string) {
    super(msg ?? TransactionError.ErrInvalidTx)
  }
}
