import { PlatformTools } from "../../platform/PlatformTools"
import {Client} from "../Client";
import {BlockchainClient} from "../../blockchain-client";
import {TerraConnectionOptions} from "./TerraConnectionOptions";
import {ClientPackageNotInstalledError} from "../../error/ClientPackageNotInstalledError";
import {Account} from "../type/Account";
import {ChainBridgeError} from "../../error/ChainBridgeError";
import {Wallet} from "@terra-money/terra.js/dist/client/lcd/Wallet";
import {CreateTxOptions, Fee, SignerOptions} from "@terra-money/terra.js";

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

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

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

    getSequence(wallet: Wallet): Promise<number> {
        return wallet.sequence()
    }

    createTx(signers: SignerOptions[], options: CreateTxOptions): Promise<any> {
        return this.lcd.tx.create(signers, options)
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

    async getFee(tx: any, feePayer: Wallet): Promise<any> {
        const estimateFee = await this.lcd.tx.estimateFee(
            [{
                sequenceNumber: await feePayer.sequence(),
                publicKey: feePayer.key.publicKey
            }],
            {
                msgs: tx
            }
        )

        return new Fee(estimateFee.gas_limit, estimateFee.amount.toString(), feePayer.key.accAddress)
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

}
