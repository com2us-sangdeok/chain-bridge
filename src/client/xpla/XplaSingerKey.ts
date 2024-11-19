import { Key, SimplePublicKey } from "@xpla/xpla.js";
import { Signer } from "../../signer/Signer";
import { keccak_256 } from '@noble/hashes/sha3';

export class XplaSignerKey extends Key {
  constructor(private signer: Signer, publicKey: Uint8Array) {
    super(new SimplePublicKey(Buffer.from(publicKey).toString('base64')));
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const digest = keccak_256(payload);
    return Buffer.from(await this.signer.sign(digest));
  }
}