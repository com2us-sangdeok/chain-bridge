export interface AccountState {
  nonce: number;
  accountNumber?: number;
  publicKey?: string;
}

export interface Account {
  address: string;
  publicKey?: string;
  privateKey: string;
  mnemonic?: string;
}