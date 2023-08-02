# chain-bridge
chain-bridge를 통해 이종의 네트워크를 연결하고 블록체인과 통신을 위해 필요한 기능을 제공한다.

Supported network:
* ~~Terra~~ (deprecated after v1.0.0)
* XPLA
* Ethereum compatible chains
  + Ethereum
  + Polygon

## Prerequisites

- [Node.js](https://nodejs.org/ko/download/)
- install typescript
```sh
$ npm install -g typescript
```

## Installation
```sh
$ npm install @blockchain/chain-bridge
```

## Usage
### Connection
블록체인 네트워크 연결설정
```typescript
// XPLA
const options: BlockchainClientOptions = { 
  type: 'xpla',
  nodeURL: 'https://cube-lcd.xpla.dev',
  chainID: 'cube_47-5'
}
const xpla = new BlockchainClient(options)
```

```typescript
// Polygon
const options: BlockchainClientOptions = { 
  type: 'polygon',
  nodeURL: 'https://rpc-mumbai.matic.today',
  chainID: '80001'
}
const polygon = new BlockchainClient(options)
```

## Version
Please see the [CHANGELOG](CHANGELOG.md) for an exhaustive list of changes.
