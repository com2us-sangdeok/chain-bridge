import {SignOptions} from "@terra-money/terra.js";

export interface SignatureOptions {
    mnemonic: string;
    isClassic: boolean;
    signOptions: SignOptions;
}
