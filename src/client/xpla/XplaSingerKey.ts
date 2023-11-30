import { Key, SimplePublicKey } from "@xpla/xpla.js";
import { Signer } from "../../signer/Signer";
import { keccak256 } from "@ethersproject/keccak256";

export class XplaSignerKey extends Key {
  constructor(private signer: Signer, publicKey: Uint8Array) {
    super(new SimplePublicKey(Buffer.from(publicKey).toString('base64')));
  }

  async sign(payload: Buffer): Promise<Buffer> {
    const digest = Buffer.from(keccak256(payload).substring(2), 'hex');
    return Buffer.from(await this.signer.sign(digest));
  }
}