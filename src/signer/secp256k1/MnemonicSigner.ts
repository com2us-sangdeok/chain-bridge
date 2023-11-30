import * as bip39 from "bip39";
import * as bip32 from "bip32";
import { RawKeySigner } from "./RawKeySigner";

export class MnemonicSigner extends RawKeySigner {
  constructor(mnemonic: string, options = { account: 0, index: 0, coinType: 60 }) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    const wallet = node.derivePath(`m/44'/${options.coinType}'/${options.account}'/0/${options.index}`);
    const privateKey = wallet.privateKey;
    if(!privateKey) {
      throw new Error('Failed to derive key pair from mnemonic passphrase');
    }
    super(privateKey);
  }
}