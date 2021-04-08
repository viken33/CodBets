const API = require('@callofduty/api');
const Firestore = require('@google-cloud/firestore');
const { ethers } = require('ethers');
const fs = require('fs');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
let contract = fs
  .readFileSync('../hardhat/artifacts/contracts/CodBets.sol/CodBets.json')
  .toString();
contract = JSON.parse(contract);

const address = fs
  .readFileSync('../hardhat/artifacts/CodBets.address')
  .toString();
let nemo;
nemo = fs.readFileSync(`mnemonic.txt`);
nemo = nemo.toString().trim();
let wallet = new ethers.Wallet.fromMnemonic(nemo);
const owner = wallet.connect(provider);

let codbets = new ethers.Contract(address, contract.abi, owner);
codbets_reader = codbets.connect(provider);
codbets_writer = codbets.connect(owner);

let CallOfDutyAPI = new API.default();

async function matchFinder(gamertag1, gamertag2) {
  // fetch gamers tokens from dB
  const db = new Firestore({
    projectId: 'active-venture-300323',
    keyFilename: './active-venture-300323-30065e4d2546.json',
  });

  try {
    console.log(gamertag1, gamertag2);
    const user1 = await db.collection('prueba').doc(`${gamertag1}`).get();
    const user2 = await db.collection('prueba').doc(`${gamertag2}`).get();
    const snapshot = await db.collection('prueba').get();

    if (!(user1.data() && user2.data())) return;

    const { email: email1, password: password1 } = user1.data();
    const { email: email2, password: password2 } = user2.data();

    async function getMatches(email, password) {
      let { xsrf, sso, atkn } = await CallOfDutyAPI.Authorize(email, password);

      //Set tokens to requests
      CallOfDutyAPI.UseTokens({ xsrf, sso, atkn });

      // get platform and platform-based Identity
      let { titleIdentities } = await CallOfDutyAPI.Identity();

      const { username, platform } = titleIdentities.find(
        (identity) => identity.title === 'mw'
      );

      // fetch last matches 20 matches timestamp now
      const millisecondTimestamp = new Date().getUTCMilliseconds();
      const lastTwentyMatches = await CallOfDutyAPI.MatchHistory(
        { username: username, platform: platform },
        'mp',
        'mw'
        // millisecondTimestamp
      );

      // loop through matches and save matchIds
      if (lastTwentyMatches.matches) {
        const matchIDs = lastTwentyMatches.matches.map((e) => e.matchID);
        console.log(matchIDs);
        return matchIDs;
      } else {
        return [];
      }
    }

    const matchIDs1 = await getMatches(email1, password1);
    const matchIDs2 = await getMatches(email2, password2);

    console.log('!!', matchIDs1, matchIDs2);

    // find coincidencies
    const match = matchIDs1.filter((element) => matchIDs2.includes(element));

    return match[0];
  } catch (e) {
    console.log(e);
  }
}

// A function that retrieves all active challenges
// for each challenge, calls to matchFinder passing the gamertags

async function matchCollector() {
  // retrieve all active challenges
  console.log('**** Match Collector ****');
  let challengeCount = await codbets_reader.challengeCount();
  challengeCount = ethers.BigNumber.from(challengeCount).toNumber();
  console.log(`Current challenge count is ${challengeCount}`);

  if (challengeCount == 0) return;
  // Loop through all existing challenge Ids
  for (let challengeId = 1; challengeId <= challengeCount; challengeId++) {
    // - retrieve the challenge struct
    challenge = await codbets_reader.challenges(challengeId);

    if (challenge.settled) continue;
    if (!challenge.accepted) continue;

    // - call matchFinder()
    const matchId = await matchFinder(challenge.gamertag1, challenge.gamertag2);
    // - with return matchId, call fetchWinner(matchId, gamertag1, gamertag2, challengeId)
    if (matchId) {
      console.log(`Match Id ${matchId} found for Challenge id ${challengeId}`);
      await codbets_writer.fetchWinner(
        matchId,
        challenge.gamertag1,
        challenge.gamertag2,
        challengeId
      );
    } else {
      console.log(`No matches found for Challenge id ${challengeId}`);
    }
  }
  //
}

// setInterval logic that calls matchCollector every 2 mins
setInterval(matchCollector, 6000);
