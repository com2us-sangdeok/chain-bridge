import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import { RawKeySigner } from "./RawKeySigner";
import ecc from '@bitcoinerlab/secp256k1';

export class MnemonicSigner extends RawKeySigner {
  constructor(mnemonic: string, options = { account: 0, index: 0, coinType: 60 }) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = BIP32Factory(ecc).fromSeed(seed);
    const wallet = node.derivePath(`m/44'/${options.coinType}'/${options.account}'/0/${options.index}`);
    const privateKey = wallet.privateKey;
    if(!privateKey) {
      throw new Error('Failed to derive key pair from mnemonic passphrase');
    }
    super(privateKey);
  }
}