import {
    MnemonicKey,
    LCDClient,
    MsgInstantiateContract,
    SignerOptions,
    CreateTxOptions,
    Fee /*TxAPI*/
} from "@terra-money/terra.js"
import {Wallet} from "@terra-money/terra.js/dist/client/lcd/Wallet";
// import { exSignMode } from '@terra-money/terra.proto/cosmos/tx/signing/v1beta1/signing';

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

    // todo: ethereum get nonce 확인 필요
    // fixme: if not
    public async getSequence(wallet: any): Promise<number> {
        return wallet.sequence()
    }

    public async account(address: string): Promise<any> {
        return this.lcd.auth.accountInfo(address)
    }

    public async getAccountNumber(wallet: any): Promise<number> {
        return wallet.accountNumber()
    }

    public async getTransaction(txhash: string): Promise<any> {
        return this.lcd.tx.txInfo(txhash);
    }

    public async instantiateContract(mnemonic: string, codeId: number, initMsg: any, label: string): Promise<any> {
        const wallet = this.wallet(mnemonic)

        const instantiate: MsgInstantiateContract = new MsgInstantiateContract(
            //sender address
            wallet.key.accAddress,
            //admin address
            wallet.key.accAddress,
            //code_id
            12,
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

    // todo: ethereum get fee 확인 필요
    public async fee(txObject: any, feePayer: Wallet, memo: string): Promise<any> {
        const estimateFee = await this.lcd.tx.estimateFee(
            [{
                sequenceNumber: await feePayer.sequence(),
                publicKey: feePayer.key.publicKey
            }],
            {
                msgs: txObject,
                memo: memo
            }
        )

        return new Fee(estimateFee.gas_limit, estimateFee.amount.toString(), feePayer.key.accAddress);
    }

    public async create(signers: SignerOptions[], options: CreateTxOptions): Promise<any> {
        // const tx = await lcd.tx.create([], {msgs: [exe], memo, fee})
        return this.lcd.tx.create(signers, options)
    }

    public async createTx(msgs: any, fee: any, memo: string, wallet: Wallet): Promise<any> {
        return wallet.createTx({
            msgs: msgs,
            fee: fee,
            memo: memo
        })
    }

    public async createAndSignTx(tx: any, mnemonic: string): Promise<any> {
        return this.wallet(mnemonic).createAndSignTx({
            msgs: tx
        })
    }

    public async signTx(unsignedTx: any, signData: any): Promise<any> {

        const userSignOption = {
            chainID: 'localterra',
            accountNumber: await signData.accountNumber(),
            sequence: await signData.sequence(),
            signMode: 127//exSignMode.SIGN_MODE_LEGACY_AMINO_JSON
        }

        return signData.key.signTx(unsignedTx, userSignOption)
    }

    public async broadcast(signedTx: any): Promise<any> {
        return this.lcd.tx.broadcast(signedTx)
    }

    public async contractQuery(contractAddress: string, query: any): Promise<any> {
        return this.lcd.wasm.contractQuery(contractAddress, query)
    }

}
