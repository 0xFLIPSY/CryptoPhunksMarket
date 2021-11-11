# CryptoPhunksMarket

Decentralized marketplace with 0% secondary sales fees, forked from LarvaLabs' CryptoPunksMarket smart contract.

## Allows to
- Buy and offer Phunks for sale
- Place, accept and withdraw bids
- Withdraw pending ETH from sales or overthrown bids

``Note: Contract owner can update the CryptoPhunks NFT address which is set on deployment``

## Build

- Install dependencies

```
npm install
```

- Compile contracts

```
npx hardhat compile
```

- Edit `example-secret.json`

To run tests on a fork of mainnet and get gas estimations in fiat you need to rename this file to `secret.json` and edit it with your Alchemy and CoinMarketCap API keys

## Test

- Run Mocha tests

```
npx hardhat test
```

- or in watch mode

```
npx hardhat test --watch
```
