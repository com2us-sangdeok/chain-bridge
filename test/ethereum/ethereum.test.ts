import { BlockchainClient, BlockchainClientOptions, RawKeySigner } from "../../src";
import { use, expect } from "chai";
import Web3 from "web3";
import { TxStatus } from "../../src/type";
import { EthereumCreateTxData, EthereumFeeConfig } from "../../src/client/ethereum/EthereumType";
import { Balance } from "../../src/type/Balance";
import { TransactionFactory } from "web3-eth-accounts";

use(require("chai-as-promised"));
use(require('chai-string'));

describe('Ethereum Client', () => {
  let ethereum: BlockchainClient;
  let chainId: string;

  before(() => {
    // chainId = '80001';
    chainId = '80002';
    ethereum = new BlockchainClient({
      type: 'polygon',
      // nodeURL: 'https://polygon-mumbai.g.alchemy.com/v2/UeqxXMMGZhtKVGyLavNMAULrz2Y4YLE6',
      nodeURL: 'https://polygon-amoy.g.alchemy.com/v2/d3zMD1_zHWF8OiCuM962LHU8om-EF69M',
      chainID: chainId
    } as BlockchainClientOptions);
  })

  describe('Account', () => {
    let emptyAddress: string;
    let invalidAddress: string;

    before(() => {
      emptyAddress = new Web3().eth.accounts.create().address;
      invalidAddress = '0xinvalidaddress';
    });

    describe('getBalance', () => {
      it('Should be returned the balance of empty account as zero', async function () {
        await expect(ethereum.client.getBalance(emptyAddress)).to.eventually.deep.equal({ value: BigInt(0), decimals: 18 } as Balance);
      });

      it('Should throw an error if an invalid address received', async function () {
        await expect(ethereum.client.getBalance(invalidAddress)).to.be.rejected;
      });
    });

    describe('getAccountState', () => {
      it('Should be returned the nonce of empty account as zero', async function () {
        await expect(ethereum.client.getAccountState(emptyAddress)).to.eventually.have.deep.property('nonce', 0);
      });
      it('Should throw an error if an invalid address received', async function () {
        await expect(ethereum.client.getAccountState(invalidAddress)).to.be.rejected;
      });
    });
  });

  describe('Chain data', () => {
    let blockNumber: number;
    let txhash: string;

    before(() => {
      blockNumber = 32486958;
      txhash = '0xbde44ff10e17d70f82e3c596eef2faf4424308fad6607b5acacfc4e2f99ac383';
    });

    describe('getBlock', () => {
      it('Should get a block of the correct number', async function () {
        await expect(ethereum.client.getBlock(blockNumber)).to.eventually
          .have.all.keys('number', 'hash', 'miner', 'txs', 'timestamp')
          .and.have.property('number', blockNumber);
      });
    });

    describe('getTx', () => {
      it('Should get a transaction of the correct tx hash', async function () {
        const tx = await ethereum.client.getTx(txhash);
        expect(tx).to.have.all.keys('txhash', 'blockNumber', 'status', 'fee', 'data', 'logs');
        expect(tx).to.have.property('txhash', txhash);
        expect(tx).to.have.property('blockNumber', blockNumber);
        expect(tx).to.have.property('status', <TxStatus>"success");
      });
    });
  });

  describe('Transaction', () => {
    let fromPrvKey: string;
    let createTxOptions: EthereumCreateTxData;

    before(() => {
      fromPrvKey = '3a3d1df941270ed8c30fc3b6d4f7708f96380d2dd83de1d393f7af08af8e7319';
      let to = '0xd6AFc23C314454442f452Db7fb5364953a678ed6';
      let amount = '0x5AF3107A4000';
      createTxOptions = {
        from: ethereum.client.createAccount(fromPrvKey).address,
        to: to,
        value: amount
      }
    });

    describe('createTx', () => {
      it('Should return the expected correct tx', async function () {
        const tx = await ethereum.client.createTx(createTxOptions);
        expect(tx.from).to.be.equal(createTxOptions.from);
        expect(tx.to).to.be.equal(createTxOptions.to);
        expect(Web3.utils.numberToHex(tx.value)).to.be.equalIgnoreCase(createTxOptions.value as string);
        // expect(tx.chainId).to.be.equal(chainId);
      });

      it('Should ensure that the fee values are the same as the result of createTx', async function () {
        const [tx, fee] = await Promise.all([
          ethereum.client.createTx(createTxOptions),
          ethereum.client.estimateFee(createTxOptions),
        ]);
        expect(Web3.utils.toNumber(tx.gasLimit)).to.be.equal((<EthereumFeeConfig>fee).gas);
        expect(Web3.utils.toNumber(tx.maxFeePerGas)).to.be.equal((<EthereumFeeConfig>fee).maxFeePerGas);
        expect(Web3.utils.toNumber(tx.maxPriorityFeePerGas)).to.be.equal((<EthereumFeeConfig>fee).maxPriorityFeePerGas);
      });

      it('Should ensure that the input values are the same as the result of decoding', async () => {
        const encodedTx = await ethereum.client.createTx(createTxOptions, true);
        const tx = TransactionFactory.fromSerializedData(Buffer.from(encodedTx, 'hex'))
        expect(Number(tx.nonce)).to.be.equal(createTxOptions.nonce);
        expect(tx.to?.toString()).to.equalIgnoreCase(createTxOptions.to!);
        expect(Web3.utils.numberToHex(tx.value)).to.equalIgnoreCase(createTxOptions.value as string);
      }).timeout(50000);
    });

    describe('signTx', function () {
      this.timeout(5000);
      it('Should have the correct signature', async function () {
        const tx = await ethereum.client.createTx(createTxOptions);
        const signedTx = await ethereum.client.signTx(tx, new RawKeySigner(Web3.utils.hexToBytes(fromPrvKey)));
        const signedTx2 = await ethereum.client.signTx(tx, new RawKeySigner(fromPrvKey));
        console.log(signedTx);
        console.log(signedTx2)
        // const result = await ethereum.client.sendSignedTxAsync(signedTx);
        // console.log(result)
      });
    });

    describe('signMsg', function () {
      this.timeout(5000);
      it('sign message', async function () {
        const web3 = new Web3();
        const message = 'message';
        for(let i = 0; i < 500; i++) {
          const generatedPK = web3.eth.accounts.create().privateKey;
          const signedMsg = await ethereum.client.signMsg(message, new RawKeySigner(Web3.utils.hexToBytes(generatedPK)));
          const signedMsg2 = await ethereum.client.signMsg(message, new RawKeySigner(generatedPK));
          const signedMsg3 = web3.eth.accounts.privateKeyToAccount(generatedPK).sign(message).signature;
          console.log(signedMsg)
          expect(signedMsg).to.be.equal(signedMsg2);
          expect(signedMsg).to.be.equal(signedMsg3);
        }
      });
    });
  });

  describe('Contract', () => {
    let contract: string;
    let message: string;

    before(() => {
      contract = '0xA06Ae286622F9ed0F883B95C6Fd3574CB2a8993F';
    });

    describe('queryContract', () => {
      before(() => {
        message = '0x70a082310000000000000000000000009428e6ef51feb2201676deec11b7e36f7c1f0765';
      });

      it('Should work correctly', async function () {
        await expect(ethereum.client.contractQuery(contract, message)).to.eventually.not.null;
      })
    });
  });
})