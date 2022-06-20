// import { TerraModule } from '../src/test-module/terra-module';
const terra = require("../src/test-module/terra-module").TerraModule('http://localhost:1317', 'localterra');


// let terra = new TERRA.TerraModule('http://localhost:1317', 'localterra');
const mnemonic = 'test test test high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn';

describe('terra test', function () {
    // let terra: TerraModule;

    describe('Wallet Create Test', function() {
        it('create wallet', async function() {
            const result = await terra.createWallet(mnemonic);
            console.log('wallet : ', result);
        });
    });



})