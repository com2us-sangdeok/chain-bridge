import { TerraModule } from '../src/test-module/terra-module';


const terra: TerraModule = new TerraModule('http://localhost:1317', 'localterra');
const mnemonic = 'test test test high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn';

describe('Terra test', function () {
    describe('Wallet Test', function() {
        it('create wallet', async function() {
            const result = await terra.createWallet(mnemonic);
            console.log('wallet : ', result);
        });

        it('get mnemonic', async function() {
            const result = await terra.mnemonic(mnemonic);
            console.log('mnemonic : ', result);
            console.log('mnemonic : ', result.accAddress);
        });

        it('get account info', async function() {
            const address = 'terra1k6yu867wqaar5fzr09sqgywdwmulk7mx3ydtfq'
            const result = await terra.accountInfo(address);
            console.log('address : ', result);
        })

        it('get account info', async function() {
            const address = 'terra1k6yu867wqaar5fzr09sqgywdwmulk7mx3ydtfq'
            const result = await terra.accountInfo(address);
            console.log('address : ', result);
        })
    });



})