const API = require('@callofduty/api');
const Firestore = require('@google-cloud/firestore');
const { ethers } = require('hardhat');
const bre = require('hardhat');
const fs = require('fs');

const provider = ethers.getDefaultProvider('http://localhost:8545');
// ver como sacar el signer que deploya el contrato
//   const owner = await provider.getSigner();

const contractName = 'CodBets';
let contract = fs
  .readFileSync(
    `${bre.config.paths.artifacts}/contracts/${contractName}.sol/${contractName}.json`
  )
  .toString();
const address = fs
  .readFileSync(`${bre.config.paths.artifacts}/${contractName}.address`)
  .toString();
contract = JSON.parse(contract);
bre.config.paths.root;
let localDeployerMnemonic;
localDeployerMnemonic = fs.readFileSync(
  `${bre.config.paths.root}/mnemonic.txt`
);
localDeployerMnemonic = localDeployerMnemonic.toString().trim();
let owner = new ethers.Wallet.fromMnemonic(localDeployerMnemonic);

const getOwner = async () => {
  try {
    [owner] = await ethers.getSigners();
  } catch (e) {
    console.log(e);
  }
};
getOwner();

let codbets = new ethers.Contract(address, contract.abi, owner);
codbets_reader = codbets.connect(provider);
codbets_writer = codbets.connect(owner);

const CallOfDutyAPI = new API.default();

async function matchFinder(gamertag1, gamertag2) {
  // fetch gamers tokens from dB
  const db = new Firestore({
    projectId: 'active-venture-300323',
    keyFilename: '../active-venture-300323-30065e4d2546.json',
  });
  try {
    const user1 = await db.collection('users').doc(`${gamertag1}`).get();
    const user2 = await db.collection('users').doc(`${gamertag2}`).get();
    const snapshot = await db.collection('users').get();
    const { xsrf: xsrf1, sso: sso1, atkn: atkn1 } = user1.data();
    const { xsrf: xsrf2, sso: sso2, atkn: atkn2 } = user2.data();

    //Set tokens to requests
    CallOfDutyAPI.UseTokens({ xsrf1, sso1, atkn1 });
    // get platform and platform-based Identity
    const { titleIdentities1 } = await CallOfDutyAPI.Identity();
    const { username1, platform1 } = titleIdentities1.find(
      (identity) => identity.title === 'mw'
    );
    // fetch last matches 20 matches timestamp now
    const millisecondTimestamp = new Date().getUTCMilliseconds();
    const lastTwentyMatches1 = await CallOfDutyAPI.MatchHistory(
      { username: username1, platform: platform1 },
      'mp',
      'mw',
      millisecondTimestamp
    );
    // loop through matches and save matchIds
    const matchIDs1 = lastTwentyMatches1.matches.map((e) => e.matchID);

    //Set tokens to requests
    CallOfDutyAPI.UseTokens({ xsrf2, sso2, atkn2 });
    // get platform and platform-based Identity
    const { titleIdentities2 } = await CallOfDutyAPI.Identity();
    const { username2, platform2 } = titleIdentities2.find(
      (identity) => identity.title === 'mw'
    );
    // fetch last match just to log gamertag
    const lastTwentyMatches2 = await CallOfDutyAPI.MatchHistory(
      { username: username2, platform: platform2 },
      'mp',
      'mw',
      millisecondTimestamp
    );
    // loop through matches and save matchIds
    const matchIDs2 = lastTwentyMatches2.matches.map((e) => e.matchID);

    // find coincidencies
    const match = matchIDs1.filter((element) => matchIDs2.includes(element));

    return match[0];
  } catch (e) {
    console.log(e);
  }
}

// login('viken33@gmail.com', 'ROMPEcod#1');

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
        gamerta1,
        gamertag2,
        challengeId
      );
    } else {
      console.log(`No matches found for Challenge id ${challengeId}`);
    }
  }
  //
}

// matchCollector();

// setInterval logic that calls matchCollector every 2 mins
setInterval(matchCollector, 6000);
