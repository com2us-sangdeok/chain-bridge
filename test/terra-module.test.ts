import { TerraModule } from '../src/test-module/terra-module';
// import {SignatureOptions} from "../src/client/type/SignatureOptions";
// import {MsgExecuteContract} from "@terra-money/terra.js";
import { expect } from "chai"

const terraModule: TerraModule = new TerraModule('http://localhost:1317', 'localterra');
const test1 = 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius';
const user1 = 'test test test1 high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn';

describe('Terra test', function () {
    describe('Wallet Test', function() {
        it('create wallet', function() {
            const result = terraModule.wallet(user1);
            console.log('wallet : ', result);
        });

        it('get sequence', function() {
            const result = terraModule.getSequence(test1);
            console.log('sequence : ', result);
            expect(result).not.to.be.null
        });

        it('get txhash', async function() {
            const txhash = "CBB3CE6EB6997D2E0A0BEA973353DA820D9FFCE303D5476E99CFA04739D6FC3C"
            const result = await terraModule.getTransaction(txhash);
            expect(result).not.to.be.null
            expect(result.height).to.be.eql(22)
            console.log('transaction : ', result);
        });

        it('get account', async function() {
            const result = await terraModule.account('terra17qrf2jkpaqwxq2ltywzggtdu2mvsj577rxqgdy');
            console.log('mnemonic : ', result);
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

    it('get sequence',  async function() {
        const result = await terraModule.getSequence(test1);
        expect(result).not.to.be.null
        console.log('result : ', result);
    })

    it('get accountNumber',  async function() {
        const result = await terraModule.getAccountNumber(test1);
        expect(result).not.to.be.null
        console.log('result : ', result);
    })

    // it('sign tx',  async function() {
    //     const sender =  terraModule.wallet(test1);
    //     const recipient =  terraModule.wallet(user1);
    //     const tokenAddress = "terra14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9ssrc8au";
    //
    //     const transferC2x = new MsgExecuteContract(sender.key.accAddress, tokenAddress, {
    //         transfer: {
    //             amount: "1",
    //             recipient: recipient.key.accAddress,
    //         },
    //     });
    //
    //     const unsignedTx =
    //         terraModule.createTx(
    //             [],
    //             {
    //                 msgs: [transferC2x]
    //             }
    //         )
    //
    //     const signOption: SignatureOptions = {
    //         mnemonic: test1,
    //         signOptions: {
    //             chainID: 'localterra',
    //             accountNumber: sender.sequence(),
    //             sequence: sender.accountNumber(),
    //             signMode: 127
    //         },
    //         isClassic: true
    //     }
    //
    //     const result = await terraModule.signTx(unsignedTx, signOption);
    //     console.log('mnemonic : ', result);
    // });

})