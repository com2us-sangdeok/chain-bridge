import { PlatformTools } from "../../platform/PlatformTools"
import { Client } from "../Client";
import { BlockchainClient } from "../../blockchain-client";
import { TerraConnectionOptions } from "./TerraConnectionOptions";
import { ClientPackageNotInstalledError } from "../../error/ClientPackageNotInstalledError";
import { Account } from "../type/Account";
import { ChainBridgeError } from "../../error/ChainBridgeError";
import { Wallet } from "@terra-money/terra.js/dist/client/lcd/Wallet";
import { CreateTxOptions, Fee, LCDClient, Msg } from "@terra-money/terra.js";

export class TerraClient implements Client {
    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    /**
     * Connection used by client.
     */
    connection: BlockchainClient

    /**
     * Terra underlying library.
     */
    terra: any

    lcd: any

    chainID: string | undefined

    // -------------------------------------------------------------------------
    // Public Implemented Properties
    // -------------------------------------------------------------------------

    /**
     * Connection options.
     */
    options: TerraConnectionOptions

    /**
     * Master database used to perform all write queries.
     */
    blockchain?: string

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(connection: BlockchainClient) {
        this.connection = connection
        this.options = {
            ...connection.options,
        } as TerraConnectionOptions

        // load terra package
        this.loadDependencies()
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    public getLcdClient(): LCDClient {
        return this.lcd
    }

    public async getBalance(address: string): Promise<any> {

        // let balance: [Coins, Pagination]
        let balance = [];
        try {
            balance = (await this.lcd.bank.balance(address))[0].toData()
        } catch (e) {
            balance = []
        }

        return balance

    }

    public createAccount(mnemonic: string): Account {

        const mk = new this.terra.MnemonicKey({
            mnemonic: mnemonic,
        })

        const account: Account = {
            address: mk.accAddress,
            publicKey: mk.publicKey.key,
            privateKey: mk.mnemonic
        }

        try {
            this.lcd.wallet(mk)
        } catch (e) {
            throw new ChainBridgeError(`error occurred while creating an account.`)
        }

        return account
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    getSequence(wallet: Wallet): Promise<number> {
        return wallet.sequence()
    }

    createTx(options: CreateTxOptions): Promise<any> {
        return this.lcd.tx.create([], options)
    }

    // fixme: add isClassic value into signTx fn
    async signTx(unsignedTx: any, signData: any): Promise<any> {
        const userSignOption = {
            chainID: this.chainID,
            accountNumber: await signData.accountNumber(),
            sequence: await signData.sequence(),
            signMode: 127//exSignMode.SIGN_MODE_LEGACY_AMINO_JSON
        }
        return signData.key.signTx(unsignedTx, userSignOption)
    }

    // todo: check broadcastAsync, broadcastSync
    sendSignedTx(signedTx: any): Promise<any> {
        return this.lcd.tx.broadcast(signedTx)
    }

    getTx(txhash: string): Promise<any> {
        return this.lcd.tx.txInfo(txhash)
    }

    async getFee(msgs: Msg[], feePayer: string, signerList: string[]): Promise<any> {
        const signers = []

        for (const signer of signerList) {
            const accountInfo = await this.lcd.auth.accountInfo(signer);

            signers.push({
                sequenceNumber: accountInfo.getSequenceNumber(),
                publicKey: accountInfo.getPublicKey(),
            });
        }

        const estimateFee = await this.lcd.tx.estimateFee(signers,
            {
                msgs: msgs,
                gasAdjustment: 1.5
            }
        )

        return new Fee(estimateFee.gas_limit, estimateFee.amount.toString(), feePayer)
    }

    decodeTx(encodedTx: string): any {
        return this.lcd.tx.decodeTx(encodedTx)
    }

    encodeTx(tx: any): string {
        return this.lcd.tx.encodeTx(tx)
    }

    contractQuery(contractAddress: string, query: any): Promise<any> {
        return this.lcd.wasm.contractQuery(contractAddress, query)
    }

    // only for terra
    wallet(mnemonic: string): any {
        const mk = new this.terra.MnemonicKey({
            mnemonic: mnemonic,
        })

        return this.lcd.wallet(mk)
    }

    getAccountNumber(wallet: any): Promise<number> {
        return wallet.accountNumber()
    }

    account(address: string): Promise<any> {
        return this.lcd.auth.accountInfo(address)
    }

    protected loadDependencies(): void {
        try {
            const terra = this.options.client || PlatformTools.load("terra")
            this.terra = terra
            this.lcd = new this.terra.LCDClient({
                URL: this.options.nodeURL,
                chainID: this.options.chainID
            })
            this.chainID = this.options.chainID
        } catch (e) {
            throw new ClientPackageNotInstalledError(
                "Terra",
                "terra",
            )
        }
    }

}
