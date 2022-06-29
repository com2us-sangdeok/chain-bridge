import { TerraModule } from '../src/test-module/terra-module';
// import {SignatureOptions} from "../src/client/type/SignatureOptions";
import {MsgExecuteContract} from "@terra-money/terra.js";
import { expect } from "chai"

const terraModule: TerraModule = new TerraModule('http://localhost:1317', 'localterra');
const test1 = 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius';
const user1 = 'test test test1 high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn';

describe('Terra test', function () {

    describe('Wallet Test', function() {
        let wallet: any;
        before(
            async () =>(wallet = terraModule.wallet(test1))
        )

        it('create wallet', function() {
            expect(wallet).not.to.be.null
            console.log('create wallet : ', wallet);
        });

        it('get sequence', async function() {
            const result = await terraModule.getSequence(wallet);
            expect(result).not.to.be.null
            console.log('sequence : ', result);
        });

        it('get accountNumber',  async function() {
            const result = await terraModule.getAccountNumber(wallet);
            expect(result).not.to.be.null
            expect(result).to.be.eql(1)
            console.log('accountNumber : ', result);
        })

        it('get account', async function() {
            const result = await terraModule.account(wallet.key.accAddress);
            console.log('account : ', result);
        })

    })

    describe('TX Test', function() {
        it('get fee',  async function() {
            const sender =  terraModule.wallet(test1);
            const recipient =  terraModule.wallet(user1);
            const tokenAddress = "terra14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9ssrc8au";
            const transferC2x = new MsgExecuteContract(sender.key.accAddress, tokenAddress, {
                transfer: {
                    amount: "1",
                    recipient: recipient.key.accAddress,
                },
            });

            const txObject = [transferC2x]

            const result = await terraModule.fee(txObject, sender, '')
            console.log('tx fee: ', result)
            expect(result).not.to.be.null
            expect(result.gas_limit).to.be.eql(209560)
            expect(result.payer).to.be.eql(sender.key.accAddress)
        })

        it('create tx',  async function() {
            const sender =  terraModule.wallet(test1);
            const recipient =  terraModule.wallet(user1);
            const tokenAddress = "terra14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9ssrc8au";
            const transferC2x = new MsgExecuteContract(sender.key.accAddress, tokenAddress, {
                transfer: {
                    amount: "1",
                    recipient: recipient.key.accAddress,
                },
            });

            const txObject = [transferC2x]

            const fee = await terraModule.fee(txObject, sender, '')

            const result = await terraModule.create(
                [],
                {
                    msgs: [transferC2x],
                    memo: '',
                    fee
                }
            )

            console.log('create tx: ', result)
            expect(result).not.to.be.null
        })

        it('send sign tx',  async function() {
            // const sender =  terraModule.wallet(test1);
            // const recipient =  terraModule.wallet(user1);
            // const tokenAddress = "terra1wxvlkpqfekzc5macvm23cg724rxef6zdng0nl3t2ar7z3lxfyhmqf0zu55";
            // const transferC2x = new MsgExecuteContract(sender.key.accAddress, tokenAddress, {
            //     transfer: {
            //         amount: "1",
            //         recipient: recipient.key.accAddress,
            //     },
            // });
            //
            // const txObject = [transferC2x]
            //
            // const fee = await terraModule.fee(txObject, sender, '')
            //
            // const tx = await terraModule.create(
            //     [],
            //     {
            //         msgs: [transferC2x],
            //         memo: '',
            //         fee
            //     }
            // )
            // const unsignedTx = await terraModule.createTx(
            //     txObject, fee, '', test1
            // )
            //
            //
            // const signOption: SignatureOptions = {
            //     passphrase: test1,
            //     signOptions: {
            //         chainID: 'localterra',
            //         accountNumber: await sender.accountNumber(),
            //         sequence: await sender.sequence(),
            //         signMode: 127
            //     },
            //     isClassic: true
            // }
            //
            // const result = await terraModule.signTx(tx, signOption);
            //
            // const signedTx = sender.key.signTx(unsignedTx);
            //
            // const result = await terraModule.broadcast(unsignedTx)
            // console.log('sign tx : ', result);
        });

        it('send sign tx v2',  async function() {
            const senderWallet =  terraModule.wallet(test1);
            const recipient =  terraModule.wallet(user1);
            const tokenAddress = "terra1wxvlkpqfekzc5macvm23cg724rxef6zdng0nl3t2ar7z3lxfyhmqf0zu55";
            const transferC2x = new MsgExecuteContract(senderWallet.key.accAddress, tokenAddress, {
                transfer: {
                    amount: "1",
                    recipient: recipient.key.accAddress,
                },
            });
            const txObject = [transferC2x]
            const fee = await terraModule.fee(txObject, senderWallet, '')
            const unsignedTx = await terraModule.createTx(
                txObject, fee, '433', senderWallet
            )

            const signedTx = await terraModule.signTx(
                unsignedTx, senderWallet
            )

            const result = await terraModule.broadcast(signedTx)
            console.log('tx : ', result);
        });

        it('send sign tx v3',  async function() {
            const sender =  terraModule.wallet(test1);
            const recipient =  terraModule.wallet(user1);
            const tokenAddress = "terra1wxvlkpqfekzc5macvm23cg724rxef6zdng0nl3t2ar7z3lxfyhmqf0zu55";
            const transferC2x = new MsgExecuteContract(sender.key.accAddress, tokenAddress, {
                transfer: {
                    amount: "2",
                    recipient: recipient.key.accAddress,
                },
            });

            const txObject = [transferC2x]

            const unsignedTx = await terraModule.createAndSignTx(
                txObject, test1
            )

            const result = await terraModule.broadcast(unsignedTx)
            console.log('tx : ', result);
        });

        it('balance', async function() {
            const tokenAddress = "terra1wxvlkpqfekzc5macvm23cg724rxef6zdng0nl3t2ar7z3lxfyhmqf0zu55";
            const walletAddress = "terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v";
            const result = await terraModule.contractQuery(tokenAddress, {
                balance: { address: walletAddress },
            });
            console.log('balance: ', result)
        })

        it('get txhash', async function() {
            const txhash = "CBB3CE6EB6997D2E0A0BEA973353DA820D9FFCE303D5476E99CFA04739D6FC3C"
            const result = await terraModule.getTransaction(txhash);
            expect(result).not.to.be.null
            expect(result.height).to.be.eql(22)
            console.log('transaction : ', result);
        });
    })

    describe('Contract Test', function() {
        it('upload contract', async function() {

        })

        it('instantiate contract', async function() {
            const codeId = 1;
            const initMessage = {
                "name": "Bit Money",
                "symbol": "BTM",
                "decimals": 2,
                "initial_balances": [
                    {
                        "amount": "100000",
                        "address": "terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v"
                    }
                ]
            }
            const label = "test token";
            const result = await terraModule.instantiateContract(test1, codeId, initMessage, label)
            expect(result).not.to.be.null
            console.log('result : ', result);
        })
    });
})