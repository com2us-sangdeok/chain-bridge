export interface Account {
  address: string;
  publicKey: string;
  privateKey: string;
}

export interface Keystore {
  keystore: any;
  address: string;
  passphrase: string;
}
