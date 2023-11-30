export interface Signer {
  getPublicKey(compressed?: boolean): Promise<Uint8Array>;
  sign(digest: Uint8Array): Promise<Uint8Array>;
}
