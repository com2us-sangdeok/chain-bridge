import { BlockchainClient, BlockchainClientOptions } from "../../src/index";
import { use, expect } from "chai";
import { LCDClient, MsgSend } from "@xpla/xpla.js";
import { TxStatus } from "../../src/type";
import { XplaCreateTxData, XplaFeeConfig } from "../../src/client/xpla/XplaType";
import { Balance } from "../../src/type/Balance";

use(require("chai-as-promised"));

describe('Xpla Client', () => {
  let xpla: BlockchainClient;

  before(() => {
    xpla = new BlockchainClient({
      type: 'xpla',
      nodeURL: 'https://cube-lcd.xpla.dev',
      chainID: 'cube_47-5'
    } as BlockchainClientOptions);
  });

  describe('Account', () => {
    let emptyAddress: string;
    let invalidAddress: string;

    before(() => {
      emptyAddress = xpla.client.createAccount().address;
      invalidAddress = 'xplainvalidaddress';
    });

    describe('getBalance', () => {
      it('Should be returned the balance of empty account as zero', async function () {
        await expect(xpla.client.getBalance(emptyAddress)).to.eventually.deep.equal({ value: BigInt(0), decimals: 18 } as Balance);
      });
      it('Should throw an error if an invalid address received', async function () {
        await expect(xpla.client.getBalance(invalidAddress)).to.be.rejected;
      });
    });

    describe('getAccountState', () => {
      it('Should throw an error if an empty address received', async function () {
        await expect(xpla.client.getAccountState(emptyAddress)).to.be.rejected;
      });
      it('Should throw an error if an invalid address received', async function () {
        await expect(xpla.client.getAccountState(invalidAddress)).to.be.rejected;
      });
    });
  });

  describe('Chain data', () => {
    let blockNumber: number;
    let txhash: string;

    before(() => {
      blockNumber = 2578385;
      txhash = '25796C55BF78A34DB480C670CEEC17ED335D7E6F2A061D0D36B514F763C67611';
    });

    describe('getBlock', () => {
      it('Should get a block of the correct number', async function () {
        await expect(xpla.client.getBlock(blockNumber)).to.eventually
          .have.all.keys('number', 'hash', 'miner', 'txs', 'timestamp')
          .and.have.property('number', blockNumber);
      });
    });
    describe('getTx', () => {
      it('Should get a transaction of the correct tx hash', async function () {
        const tx = await xpla.client.getTx(txhash);
        expect(tx).to.have.all.keys('txhash', 'blockNumber', 'status', 'fee', 'data', 'logs');
        expect(tx).to.have.property('txhash', txhash);
        expect(tx).to.have.property('blockNumber', blockNumber);
        expect(tx).to.have.property('status', <TxStatus>"success");
      });
    });
  });

  describe('Transaction', () => {
    let fromMnemonic: string;
    let createTxOptions: XplaCreateTxData;

    before(() => {
      fromMnemonic = 'section task latin write whip rain magic basic hunt junior random noble test fruit health bottom pole melody wild bacon mom trash reopen stomach';
      let to = 'xpla1n88cvfxxhgzkalkqzsdd5qaeslxhlsux60mrww';
      let amount = '1000000000';
      let memo = '1234';
      let from = xpla.client.createAccount(fromMnemonic).address;
      createTxOptions = {
        signers: [{ address: from }],
        msgs: [
          new MsgSend(from, to, { axpla: amount })
        ],
        memo: memo
      };
    });

    describe('createTx', () => {
      let expectedUnsignedTx: string;
      before(() => {
        expectedUnsignedTx = 'CpgBCo8BChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEm8KK3hwbGExNWpqbGswMmdnOW15NmU0amR3emw0cHJxMzZqanNxengyZTV4djASK3hwbGExbjg4Y3ZmeHhoZ3prYWxrcXpzZGQ1cWFlc2x4aGxzdXg2MG1yd3caEwoFYXhwbGESCjEwMDAwMDAwMDASBDEyMzQSIxIhChsKBWF4cGxhEhIxMjAzNDkxNjI1MDAwMDAwMDAQk9II';
      });
      it('test', async () => {
        console.log(await xpla.client.createTx(createTxOptions, false))
      })

      it('Should return the expected correct tx', async function () {
        const unsignedTx = await xpla.client.createTx(createTxOptions, true);
        expect(unsignedTx).to.be.equal(expectedUnsignedTx);
      });

      it('Should ensure that the input values are the same as the result of decoding', async function () {
        const unsignedTx = await xpla.client.createTx(createTxOptions, true)
        const decodedTx = (<LCDClient>xpla.client.getProvider()).tx.decode(unsignedTx);
        expect(decodedTx.body.memo).to.be.equal(createTxOptions.memo);
        expect(decodedTx.body.messages).to.be.deep.equal(createTxOptions.msgs);
      });

      it('Should ensure that the fee values are the same as the result of createTx', async function () {
        const [unsignedTx, estimateFee] = await Promise.all([
          xpla.client.createTx({ ...createTxOptions, gasAdjustment: 1.5 }, true),
          xpla.client.estimateFee(createTxOptions)
        ]);
        const feeInTx = (<LCDClient>xpla.client.getProvider()).tx.decode(unsignedTx).auth_info.fee.toData();
        expect(feeInTx.gas_limit).to.be.equal((<XplaFeeConfig>estimateFee).fee.gas_limit);
      });
    });

    describe('signTx', () => {
      it('Should have the correct signature', async function () {
        const tx = await xpla.client.createTx(createTxOptions, true);
        const signedTx = await xpla.client.signTx(tx, fromMnemonic);
        console.log(signedTx);

        // const result = await xpla.client.sendSignedTx(signedTx);
        // console.log(result)
      });

      it('Should be able to create and sign tx with a specified sequence number', async function () {
        const customSequenceNumber = 1100;
        const customTxOptions = { ...createTxOptions };
        customTxOptions.signers[0] = { ...customTxOptions.signers[0], sequenceNumber: customSequenceNumber };
        const tx = await xpla.client.createTx(customTxOptions, true);
        const signedTx = await xpla.client.signTx(tx, fromMnemonic);
        const decodedTx = (<LCDClient>xpla.client.getProvider()).tx.decode(signedTx);
        expect(decodedTx.auth_info.signer_infos[0].sequence).to.be.equal(customSequenceNumber);
      })
    });
  });

  describe('Contract', () => {
    let contract: string;
    let message: any;

    before(() => {
      contract = 'xpla14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s525s0h';
      message = { balance: { address: 'xpla12ndjjqce43j69pczveuzd0g64zufk4j7qn7fhh' } };
    });

    describe('queryContract', () => {
      it('Should work correctly', async function () {
        await expect(xpla.client.contractQuery(contract, message)).to.eventually.have.ownProperty('balance');
      })
    })
  });
});
