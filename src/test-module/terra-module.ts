import {  MnemonicKey, LCDClient } from "@terra-money/terra.js"

export class TerraModule {
    private readonly lcd: LCDClient;

    constructor(url: string, id: string) {
        this.lcd = new LCDClient({
            URL: url,
            chainID: id,
        });
    }

    public createWallet(mnemonic: string): any {
        const mk = new MnemonicKey({
            mnemonic: mnemonic,
        });
        return this.lcd.wallet(mk);
    }

    public mnemonic(mnemonic: string): any {
        const mk = new MnemonicKey({
            mnemonic: mnemonic,
        });
        return mk
    }

    public accountInfo(address: string): any {
        return this.lcd.auth.accountInfo(address)
    }

}
