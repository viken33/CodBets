pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

/**
 * 
 * @author @viken33 and @famole
 * @description This contract is used to place and handle Bets for the CodBets Dapp
 * It allows players to place bets against each other which are settled in a trustless fashion
 * A player can place a bet sending value to the contract, including his Call of Duty gamertag,
 * his opponent gamertag and address.
 * CodBets searches for the next match they play together, and settles the bet automatically
 * based on a Chainlink Oracle API Request.
 
 * @requires
 * We use Open Zeppelin SafeMath and Ownable
 * and Chainlink Client
 */
 
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract CodBets is Ownable, ChainlinkClient {
    
    using SafeMath for uint256;
    
    
    struct Challenge {
        address payable player1;
        string gamertag1;
        address payable player2;
        string gamertag2;
        uint256 amount;
        bool accepted;
        bool settled;
    }
    
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    uint256 challengeCount;                                  // generate challengeIds by counting
    mapping(uint256 => Challenge) public challenges;         // challengeId => Challenge Struct
    mapping(address => uint256[]) public userChallenges;     // maps player => placed challengeIds 
    mapping(bytes32 => uint256) public matches;              // requests => challengeIds
    mapping(address => uint256[]) public receivedChallenges; // maps player => received challengeIds
    
    /** 
    * @description challenge related Events
    */
    event NewChallenge(
        address indexed _player1,
        uint256 indexed _challengeId,
        string _gamertag1,
        string _gamertag2,
        uint256 _amount
        );
        
    event RemoveChallenge(uint256 indexed _challengeId);
    event ChallengeAccepted(uint256 indexed _challengeId);
    event ChallengeSettled(uint256 indexed _challengeId, string _winner);
    
    /** 
    * @constructor defines Chainlink params
    */
    constructor() public {
        setPublicChainlinkToken();
        oracle = 0xdB524c2D3c2b3e75150eab9aCCDb1D25fEB51151;
        jobId = "5f1f3249d1354162a80c400dcd540dd4";
        fee = 0.1 * 10 ** 18; // 0.1 LINK
        challengeCount = 0;
    }

    /** 
    * @description Sets the challenge Struct linking addresses to gamertags and bet amount with msg.value
    * Returns a challengeId and maps it to player address
    * @param _gamertag1 refers to players in-game id
    * @param _gamertag2 refers to opponent in-game id
    * @param _player2 refers to opponent address
    * @param _amount bet/challenge amount
    * @return challengeid
    */
    function placeChallenge(string memory _gamertag1, string memory _gamertag2, address payable _player2, uint256 _amount) public payable returns(uint256) {
       
        require(_amount == msg.value, "amount != msg.value");
        require(_amount > 0, "amount invalid");
        
        Challenge memory chall = Challenge({
            player1 : msg.sender,
            gamertag1 : _gamertag1,
            player2 : _player2,
            gamertag2 : _gamertag2,
            amount : _amount,
            accepted : false,
            settled : false });
            
            challengeCount = challengeCount.add(1); // chalengeId based on count
            challenges[challengeCount] = chall;
            userChallenges[msg.sender].push(challengeCount);
            receivedChallenges[_player2].push(challengeCount);
            emit NewChallenge(msg.sender, challengeCount, _gamertag1, _gamertag2, _amount);
            return challengeCount;
    }
    
    /** 
    * @description Removes a challenge, its must be created by the player
    * @param _challengeid
    */

    function removeChallenge(uint256 _challengeId) public {
        require(challenges[_challengeId].player1 == msg.sender, "challenge doesn't belong to player");
        require(challenges[_challengeId].accepted == false, "challenge already accepted");

        for (uint i = 0; i < userChallenges[msg.sender].length; i++) {
            if (userChallenges[msg.sender][i] == _challengeId) {
                userChallenges[msg.sender][i] = 0;
            }
        }
        challenges[_challengeId].player1.transfer(challenges[_challengeId].amount);
        delete challenges[_challengeId];
        emit RemoveChallenge(_challengeId);
        
    }
    
    /** 
    * @description Accepts a challenge, only the challenged player can accept it
    * it must pay the bet amount along in tx value
    * @param _challengeid
    */

    function acceptChallenge(uint256 _challengeId) public payable {
        require(challenges[_challengeId].player2 == msg.sender, "wrong player2");
        require(challenges[_challengeId].amount == msg.value, "wrong amount");
        challenges[_challengeId].amount = challenges[_challengeId].amount.add(msg.value);
        challenges[_challengeId].accepted = true;
        emit ChallengeAccepted(_challengeId);
        
    }

    /** 
    * @description view function to retrieve placed challenges of player
    * @param _addr address of player
    */

    function viewChallenges(address _addr) public view returns(uint256[] memory _userChallenges) {
        return userChallenges[_addr];
    }

    /** 
    * @description view function to retrieve incoming challenges of player
    * @param _addr address of player
    */

    function viewReceivedChallenges(address _addr) public view returns(uint256[] memory _receivedChallenges) {
        return receivedChallenges[_addr];
    }

    /** 
    * @description Once a match between players of a bet takes place, CodBets calls this function
    * to fetch the winner based on a matchid. A helper function _fetchWinner gets called which
    * triggers a Chainlink Request to a node with an external adapter, that fullfils the request
    * with the gamertag of the match winner, and pays the bet.
    * @param _matchid match id, internal id on Call of Duty API
    * @param _gamertag1 refers to players in-game id
    * @param _gamertag2 refers to opponent in-game id
    * @param _challengeId
    * @param requestId is used to track request fullfilment and mapping with matchId
    */
    
    function fetchWinner(string memory _matchid, string memory _gamertag1, string memory _gamertag2, 
    uint256 _challengeId) public onlyOwner {
        bytes32 _requestId = _fetchWinner(_matchid, _gamertag1, _gamertag2);
        matches[_requestId] = _challengeId;
    }
    
    function _fetchWinner(string memory _matchid, string memory _gamertag1, string memory _gamertag2) private returns (bytes32 requestId) {
        // fetch winner from oracle/external adapter comparing scores for given matchid
        
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request.add("matchId", _matchid);
        request.add("usertag1", _gamertag1);
        request.add("usertag2", _gamertag2);
       
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /** 
    * @description fulfills Chainlink Request and settles bet/challenge
    */
     
    function fulfill(bytes32 _requestId, bytes32 _winner) public recordChainlinkFulfillment(_requestId)
    {
             
        string memory winner = string(abi.encodePacked(_winner));
        
        
        //settles the challenge
         Challenge storage chall = challenges[matches[_requestId]];
        chall.settled = true;
        
        // pays winner or splits pot in case of draw
        
        if ( keccak256(abi.encodePacked((chall.gamertag1))) == keccak256(abi.encodePacked((winner)))) {
             chall.player1.transfer(chall.amount);
         } else if (keccak256(abi.encodePacked((chall.gamertag2))) == keccak256(abi.encodePacked((winner)))) {
            chall.player2.transfer(chall.amount);
        } else {
            chall.player1.transfer(chall.amount/2);
            chall.player2.transfer(chall.amount/2);
         }
        
        // event for FE
        emit ChallengeSettled(matches[_requestId], winner);
        
    }
    
    /** 
    * @description helper function to change oracle and jobId
    * @param _oracle Oracle Address
    * @param _jobId JobId on oracle
    */
    
    function changeOracle(address _oracle, bytes32 _jobId) public onlyOwner {
        oracle = _oracle;
        jobId = _jobId;
}
   
}