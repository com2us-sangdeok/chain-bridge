import {
    MnemonicKey,
    LCDClient,
    MsgInstantiateContract,
    SignerOptions,
    CreateTxOptions,
    // TxAPI, Fee
} from "@terra-money/terra.js"

export class TerraModule {
    private readonly lcd: LCDClient;
    // private readonly txapi: TxAPI;

    constructor(url: string, id: string) {
        this.lcd = new LCDClient({
            URL: url,
            chainID: id,
        });
        // this.txapi = new TxAPI(this.lcd)
    }

    public wallet(mnemonic: string): any {
        const mk = new MnemonicKey({
            mnemonic: mnemonic,
        });
        return this.lcd.wallet(mk);
    }

    // public async signTx(unsignedTx: any, signData: any): Promise<any> {
    //     const wallet = this.wallet(signData.mnemonic)
    //     if(signData.fee === undefined) {
    //         signData.fee = await this.txapi.estimateFee(
    //             [{
    //                 sequenceNumber: wallet.sequence(),
    //                 publicKey: wallet.publicKey
    //             }],
    //             {
    //                 msgs: [unsignedTx],
    //                 memo: "signer" + wallet.sequence()
    //             }
    //         )
    //
    //     }
    //     const fee = new Fee(signData.fee.gas_limit, signData.fee.amount.toString(), wallet.key.accAddress)
    //     return await signer.key.signTx(unsignedTx, signData.signOptions, signData.isClassic)
    // }

    public async account(address: string): Promise<any> {
        return await this.lcd.auth.accountInfo(address)
    }

    public async getSequence(mnemonic: string): Promise<number> {
        return await this.wallet(mnemonic).sequence()
    }

    public async getAccountNumber(mnemonic: string): Promise<number> {
        return await this.wallet(mnemonic).accountNumber()
    }

    public async getTransaction(txhash: string): Promise<any> {
        return await this.lcd.tx.txInfo(txhash);
    }

    public async createTx(signers: SignerOptions[], options: CreateTxOptions): Promise<any> {
        return await this.lcd.tx.create(signers, options);
    }

    public async instantiateContract(mnemonic: string, codeId: number, initMsg: any, label: string): Promise<any> {
        const wallet = this.wallet(mnemonic)

        const instantiate: MsgInstantiateContract = new MsgInstantiateContract(
            //sender address
            wallet.key.accAddress,
            //admin address
            wallet.key.accAddress,
            //code_id
            1,
            //msg
            initMsg,
            {},
            label
        )

        const instantiateTx = await wallet.createAndSignTx({
            msgs: [instantiate]
        })

        const instantiateTxResult = await this.lcd.tx.broadcast(instantiateTx)

        // const contractAddress = JSON.parse(instantiateTxResult.raw_log)[0].events[0].attributes[0].value

        return instantiateTxResult
    }

}
