import * as secp256k1 from "secp256k1";
import { Signer } from "../Signer";
import { ChainBridgeError } from "../../error";

const base64RegEx = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
const hexRegEx = /^(0x|0X)?[a-fA-F0-9]+$/;

export class RawKeySigner implements Signer {
  private privateKeyBuffer: Uint8Array;
  constructor(privateKey: Uint8Array | string) {
    if(typeof privateKey === "string") {
      if(hexRegEx.test(privateKey)) {
        // hex string
        this.privateKeyBuffer = Uint8Array.from(
          Buffer.from(
            privateKey.startsWith('0x')
              ? privateKey.slice(2)
              : privateKey,
            "hex",
          ),
        );
      } else if(base64RegEx.test(privateKey)) {
        // base64 string
        this.privateKeyBuffer = Uint8Array.from(
          Buffer.from(
            privateKey, "base64"
          )
        );
      } else {
        throw new ChainBridgeError("Invalid private key.");
      }
    } else {
      this.privateKeyBuffer = privateKey
    }
  }

  async getPublicKey(compressed = false): Promise<Uint8Array> {
    return secp256k1.publicKeyCreate(this.privateKeyBuffer, compressed);
  }

  async sign(digest: Uint8Array): Promise<Uint8Array> {
    const signature = secp256k1.ecdsaSign(digest, this.privateKeyBuffer);
    return signature.signature;
  }
}