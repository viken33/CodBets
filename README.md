# 🏗 CodBets

> CodBets is a Dapp that allows Call of Duty MW players to place bets against each other using crypto.
> We use a contract to handle the bets and a Chainlink Oracle to settle them automatically.
> Dapp Basic Flow :
> 1) Player 1 logs with Activision Credentials, and places a Challenge in the contract providing both gamertags (own and opponent), the opponent eth address, and a bet amount (value sent with transaction must the same as amount). 
> 2) Player 2 logs with Activision Credentials, and accepts the Challenge (a transaction with value matching the bet amount)
> 3) CodBets polls the Activision API, and when a match between the players takes place, it fetches the winner through a Chainlink Request, and settles the bet paying the pot to the winner. In the unlikely event of a draw the pot gets split even.
> Alternative Flow: If Player 2 never accepts the challenge, Player 1 is able to remove it in order to get back the value placed in the contract.


---


#### Demo
required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


```bash
git clone https://github.com/austintgriffith/scaffold-eth.git

cd scaffold-eth
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

```bash
cd scaffold-eth
yarn chain

```

> in a third terminal window:

```bash
cd scaffold-eth
yarn deploy

```


#### Implementation 

#### Tools

#### Incoming Features

#### 

|-   <B> [ 📠 Legacy Content ](https://github.com/austintgriffith/scaffold-eth#-legacy-content) </B> - | - <B> [ 💬 Support Chat ](https://github.com/austintgriffith/scaffold-eth#-support-chat) </B> -|




# 🏃‍♀️ Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)





# 📟 Infrastructure







