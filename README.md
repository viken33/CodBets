# 🎮️💰️ CodBets

### CodBets is a Dapp that allows Call of Duty MW players to place bets against each other using crypto.
 We use a contract to handle the bets and a Chainlink Oracle to settle them automatically.
 
- Dapp Basic Flow :
 1) Player 1 logs in with Activision Account, and places a Challenge in the dApp providing both gamertags (own and opponent), the opponent eth address, and a bet amount (value sent with transaction must be equal to bet amount). 
 2) Player 2 logs in with Activision Account, and accepts the Challenge (a transaction with value matching the bet amount)
 3) CodBets polls the Activision API using [a backend service](https://github.com/viken33/match-collector), and when a match between the players takes place, it fetches the winner through a Chainlink Request, and settles the bet paying the pot to the winner. In the unlikely event of a draw the pot gets split even.
 Alternative Flow: If Player 2 never accepts the challenge, Player 1 is able to remove it in order to get back the value placed in the contract.


---
### Live Demo

We have a [Live Demo on Kovan Testnet](https://ipfs.io/ipfs/QmSNDUpJauzSb9VGs2d2Kzy7De3Ac1mNZ4gSjK4nHWiS4c) (no ENS available on Kovan :( )
Try it out and please let us know your comments!


### Local Demo
required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

For a local demo, please clone the 'demo' brach of this repo:

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

The codservice uses a wallet, so first we need to generate a mnemonic:

```bash
yarn generate

```
Then we run the backend service:

```bash
yarn cod

```
When the app loads, set your Metamask to localhost and you are good to go!

In order to try the whole demo you need to play a match on Call of Duty MW, so... have fun !

#### Implementation 

We used scaffold-eth repo as a base for the Dapp. It has Hardhat/Ethers.js and React in the frontend.
For Chainlink integration we built [this external adapter](https://github.com/viken33/CodBets-external-CL-adapter), and hosted it in our own Chainlink node on Kovan Network.
The Frontend is a basic interface to interact with the contract, and provide the Activision Account for the API. We decided to have most of the API interaction running in backend to find the first match between players of a bet from the moment the bet/challenge gets accepted, and then use the external adapter to settle the match result, without further interaction from the users. 
An alternative approach would be to manage all API-related tasks on the External Adapter, or to settle the bet from a User initiated action on the dApp. All this alternatives were over the table during the design process.
For backend infrastructure we used GCP, an also for hosting the Chainlink Node and EA.

#### Tools

- Scaffold-Eth
- Hardhat
- React
- Chainlink
- GCP
- IPFS
- VSCode

#### Incoming Features

- Support for ERC20 tokens
- Multiparty bets
- Subgraph integration
- Other Gamemodes (warzone, blackops)
- Mainnet deployment







