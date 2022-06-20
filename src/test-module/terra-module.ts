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
}

// module.exports = {
//     // wallet 생성
//     createWallet: function() {
//         const mk = new MnemonicKey({
//             mnemonic: mnemonic,
//         });
//         return terra.wallet(mk);
//     },
//     // 컨트렉트 배포
//     deployContract: function() {
//
//     },
//
// };