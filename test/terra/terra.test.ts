import {BlockchainClient, BlockchainClientOptions} from "../../src/index";
import {expect} from "chai";
import {ContractMsg} from "../../src/client/type/MappedContractType";

const test1 = 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius';
const user1 = 'test test test high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn';

const options: BlockchainClientOptions = {
    type: 'terra',
    nodeURL: 'http://localhost:1317',
    chainID: 'localterra',
    isClassic: true
}
const terra = new BlockchainClient(options)

describe('Connection', () => {
    describe('wallet test', function () {
        let wallet: any
        before(
            async () => (wallet = terra.client.wallet(test1))
        )

        it('create wallet', function () {
            const result = terra.client.createAccount(user1)
            expect(result).not.to.be.null
            console.log('create wallet : ', result)
        });

        it('get sequence', async function () {
            const result = await terra.client.getSequence(wallet)
            expect(result).not.to.be.null
            console.log('sequence : ', result);
        });

        it('get accountNumber', async function () {
            const result = await terra.client.getAccountNumber(wallet)
            expect(result).not.to.be.null
            expect(result).to.be.eql(1)
            console.log('accountNumber : ', result);
        })

        it('get account', async function () {
            const result = await terra.client.account(wallet.key.accAddress);
            expect(result).not.to.be.null
            expect(result.address).to.be.eql('terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v')
            console.log('account : ', result);
        })

    })

    describe('TX Test', function () {
        const senderAddress: string = 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v'
        const recipientAddress: string = 'terra1k6yu867wqaar5fzr09sqgywdwmulk7mx3ydtfq'
        const tokenAddress: string = 'terra1wxvlkpqfekzc5macvm23cg724rxef6zdng0nl3t2ar7z3lxfyhmqf0zu55';
        let transferC2x: any
        let txObject: any

        before(
            async () => (
                transferC2x = new ContractMsg(senderAddress, tokenAddress, {
                    transfer: {
                        amount: '3',
                        recipient: recipientAddress,
                    },
                }),
                    txObject = [transferC2x]
            )
        )
        it('get fee', async function () {
            const wallet = terra.client.wallet(test1)
            const result = await terra.client.getFee(txObject, wallet)
            expect(result).not.to.be.null
            // expect(result.gas_limit).to.be.eql(209555)
            expect(result.payer).to.be.eql(wallet.key.accAddress)
            console.log('tx fee: ', result)
        })

        it('create tx', async function () {
            const wallet = terra.client.wallet(test1)
            const fee = await terra.client.getFee(txObject, wallet)

            const result = await terra.client.createTx(
                [],
                {
                    msgs: [transferC2x],
                    memo: '',
                    fee
                }
            )

            expect(result).not.to.be.null
            console.log('create tx: ', result)
        })

        it('sign tx', async function () {
            const senderWallet = terra.client.wallet(test1)
            const fee = await terra.client.getFee(txObject, senderWallet)
            const unsignedTx = await terra.client.createTx(
                [],
                {
                    msgs: [transferC2x],
                    memo: '441',
                    fee: fee
                }
            )

            const result = await terra.client.signTx(unsignedTx, senderWallet);
            expect(result).not.to.be.null
            console.log('sign tx : ', result);
        })

        it('send sign tx', async function () {
            const senderWallet = terra.client.wallet(test1)
            const fee = await terra.client.getFee(txObject, senderWallet)
            const unsignedTx = await terra.client.createTx(
                [],
                {
                    msgs: [transferC2x],
                    memo: '447',
                    fee
                }
            )
            const signedTx = await terra.client.signTx(unsignedTx, senderWallet);

            const result = await terra.client.sendSignedTx(signedTx);

            expect(result).not.to.be.null
            console.log('sign tx : ', result);
        })

        it('contract query', async function () {
            const result = await terra.client.contractQuery(tokenAddress, {
                balance: {address: senderAddress},
            });

            expect(result).not.to.be.null
            console.log('balance: ', result)
        })

        it('get txhash', async function () {
            const txhash = 'CBB3CE6EB6997D2E0A0BEA973353DA820D9FFCE303D5476E99CFA04739D6FC3C'
            const result = await terra.client.getTx(txhash);
            expect(result).not.to.be.null
            expect(result.height).to.be.eql(22)
            console.log('transaction : ', result);
        });
    })


    // describe('Contract Test', function() {
    //     it('upload contract', async function() {
    //
    //     })
    //
    //     it('instantiate contract', async function() {
    //         const codeId = 1;
    //         const initMessage = {
    //             "name": "Bit Money",
    //             "symbol": "BTM",
    //             "decimals": 2,
    //             "initial_balances": [
    //                 {
    //                     "amount": "100000",
    //                     "address": "terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v"
    //                 }
    //             ]
    //         }
    //         const label = "test token";
    //         const result = await terraModule.instantiateContract(test1, codeId, initMessage, label)
    //         expect(result).not.to.be.null
    //         console.log('result : ', result);
    //     })
    // });
})