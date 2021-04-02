const { ethers } = require('hardhat');
const { use, expect } = require('chai');
const { solidity } = require('ethereum-waffle');

use(solidity);

describe('Cod Bets', function () {
  let codbets;

  describe('Challenge functionality & Event triggering', function () {
    it('Should deploy CodBets', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const CodBets = await ethers.getContractFactory('CodBets', owner);
      codbets = await CodBets.deploy();
      await codbets.deployed();
    });

    it('Should be able to place a challenge', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const gamertag1 = 'viken33';
      const gamertag2 = 'TinFit';
      const amount = ethers.utils.parseEther('1');
      const player2 = addr2.address;

      const tx = {
        value: ethers.utils.parseEther('1'),
      };
      expect(codbets.placeChallenge(gamertag1, gamertag2, player2, amount, tx))
        .to.emit(codbets, 'NewChallenge')
        .withArgs(owner.address, 1, gamertag1, gamertag2, amount);

      expect(
        codbets.placeChallenge(gamertag1, gamertag2, addr1.address, amount, tx)
      )
        .to.emit(codbets, 'NewChallenge')
        .withArgs(owner.address, 2, gamertag1, gamertag2, amount);
    });
    it('Validates challenge data', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const gamertag1 = 'viken33';
      const gamertag2 = 'TinFit';
      const player2 = addr2.address;
      const amount = ethers.utils.parseEther('1');

      // console.log(
      //   'balance after challenge',
      //   ethers.utils.formatEther(await owner.getBalance()).toString()
      // );

      const chall = await codbets.challenges(1);
      expect(chall.player1).to.be.equal(owner.address);
      expect(chall.player2).to.be.equal(player2);
      expect(chall.gamertag1).to.be.equal(gamertag1);
      expect(chall.gamertag2).to.be.equal(gamertag2);
      expect(chall.accepted).to.be.false;
      expect(chall.settled).to.be.false;
    });

    it('Should be able to accept the challenge', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const gamertag1 = 'viken33';
      const gamertag2 = 'TinFit';
      const player2 = addr2.address;

      codbets2 = codbets.connect(addr2);
      const tx = {
        value: ethers.utils.parseEther('1'),
      };
      expect(codbets2.acceptChallenge(1, tx))
        .to.emit(codbets2, 'ChallengeAccepted')
        .withArgs(1);

      const chall = await codbets2.challenges(1);
      expect(chall.player1).to.be.equal(owner.address);
      expect(chall.player2).to.be.equal(addr2.address);
      expect(chall.gamertag1).to.be.equal(gamertag1);
      expect(chall.gamertag2).to.be.equal(gamertag2);
      expect(chall.accepted).to.be.true;
      expect(chall.settled).to.be.false;
    });
    it('Should be able to remove the challenge', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const chall = await codbets.challenges(2);
      // console.log(
      //   'balance before removing challenge',
      //   ethers.utils.formatEther(await owner.getBalance()).toString()
      // );
      expect(codbets.removeChallenge(1)).to.revertedWith(
        'challenge already accepted'
      );
      expect(codbets.removeChallenge(2))
        .to.emit(codbets, 'RemoveChallenge')
        .withArgs(2);

      // console.log(
      //   'balance after removing challenge',
      //   ethers.utils.formatEther(await owner.getBalance()).toString()
      // );
    });
    it('Shows challenge Ids for given address', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const challengesOfOwner = await codbets.viewChallenges(owner.address);
      const challengesPlayer2 = await codbets.viewReceivedChallenges(
        addr2.address
      );
      expect(challengesOfOwner[0].toNumber()).to.equal(1);
      expect(challengesOfOwner[1].toNumber()).to.equal(0);
      expect(challengesPlayer2[0].toNumber()).to.equal(1);
    });
  });

  describe('Chainlink Integration', function () {
    it('Fetch winner for given Match Id', async function () {
      const gamertag1 = 'viken33';
      const gamertag2 = 'TinFit';
      const mathcId = '18188135164338541309';

      expect(codbets.fetchWinner(mathcId, gamertag1, gamertag2, 1)).to.emit(
        codbets,
        'ChainlinkRequested'
      );

      await codbets.on(
        'ChainlinkRequested',
        console.log('*** request sent to Oracle')
      );

      // Add mock Oracle Contract to validate Request fullfilment
      // and Challenge settlement

      // const fullfil = await codbets.queryFilter('ChainlinkFullfiled');
      // console.log(fullfil);
      // expect(codbets).to.emit(codbets, 'ChainlinkFullfiled');
      // console.log(ev);

      // expect(codbets)
      //   .to.emit(codbets, 'ChallengeSettled')
      //   .withArgs(1, gamertag2);
    });
  });
});
