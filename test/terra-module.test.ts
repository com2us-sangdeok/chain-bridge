import { TerraModule } from '../src/test-module/terra-module';


const terra: TerraModule = new TerraModule('http://localhost:1317', 'localterra');
const mnemonic = 'test test test high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn';

describe('Terra test', function () {
    describe('Wallet Create Test', function() {
        it('create wallet', async function() {
            const result = await terra.createWallet(mnemonic);
            console.log('wallet : ', result);
        });
    });



})