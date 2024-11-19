import { SignOptions } from "@xpla/xpla.js";

export interface SignatureOptions {
  /**
   signData can be used for privateKey by ethereum
   signData can be used for mnemonic by terra
   */
  signData: any;
  isClassic: boolean;
  signOptions: SignOptions;
}
