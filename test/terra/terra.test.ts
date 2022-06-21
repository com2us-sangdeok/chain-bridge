import {BlockchainClient, BlockchainClientOptions} from "../../src/index";

const mnemonic = 'test test test high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn';

const options: BlockchainClientOptions = {
    type: "terra",
    nodeURL: "http://localhost:1317",
    chainID: "localterra",
    isClassic: true
}
const terra = new BlockchainClient(options)

describe("Connection", () => {
    describe("before terra is established", function () {
        it('create wallet', async function() {
            const result = await terra.client.createAccount(mnemonic)
            console.log(result)
        });

        it('get account info', async function() {
            const result = await terra.client.accountInfo('terra1k6yu867wqaar5fzr09sqgywdwmulk7mx3ydtfq');
            console.log(result)
        })
    })
})