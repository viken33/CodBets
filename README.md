# 🎮️💰️ CodBets

### CodBets is a Dapp that allows Call of Duty MW players to place bets against each other using crypto.
 We use a contract to handle the bets and a Chainlink Oracle to settle them automatically.
 
- Dapp Basic Flow :
 1) Player 1 logs with Activision Credentials, and places a Challenge in the contract providing both gamertags (own and opponent), the opponent eth address, and a bet amount (value sent with transaction must be equal to bet amount). 
 2) Player 2 logs with Activision Credentials, and accepts the Challenge (a transaction with value matching the bet amount)
 3) CodBets polls the Activision API using [a backend service](https://github.com/viken33/match-collector), and when a match between the players takes place, it fetches the winner through a Chainlink Request, and settles the bet paying the pot to the winner. In the unlikely event of a draw the pot gets split even.
 Alternative Flow: If Player 2 never accepts the challenge, Player 1 is able to remove it in order to get back the value placed in the contract.


---
### Live Demo

We have a [Live Demo on Kovan Testnet](https://ipfs.io/ipfs/QmSNDUpJauzSb9VGs2d2Kzy7De3Ac1mNZ4gSjK4nHWiS4c) 


### Local Demo
required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

For a local demo, please clone the demo brach of this repo

```bash
git clone -b demo https://github.com/viken33/CodBets.git

cd CodBets
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

```bash
yarn chain

```

> in a third terminal window:

```bash
yarn deploy

```
This will deploy the contract locally.
For the backend service you can use a script called codservice.js.
First we need to generate a mnemonic to use as deployer:

```bash
yarn generate

```
then we run the backend service:

```bash
yarn cod

```

#### Implementation 

We used scaffold-eth repo as a base for the Dapp.
For Chainlink integration we use [this external adapter](https://github.com/viken33/CodBets-external-CL-adapter), and a chainlink node hosted on Kovan Network.

#### Tools

- Scaffold-Eth
- Hardhat
- React
- Chainlink
- GCP
- IPFS

#### Incoming Features

- Support for ERC20 tokens
- Multiparty bets
- Subgraph integration
- Other Gamemodes (warzone, blackops)
- Mainnet deployment







