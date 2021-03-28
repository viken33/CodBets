pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

// import "../node_modules/hardhat/console.sol";
// import "../node_modules/@openzeppelin/contracts/access/Ownable.sol"; 
// import "../node_modules/@openzeppelin/contracts//math/SafeMath.sol";
// import "../node_modules/@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

//import "@hardhat/console.sol";
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
    uint256 challengeCount;    // genero los challengeIds en base al conteo
    mapping(uint256 => Challenge) public challenges;       // challengeId => Challenge Struct
    mapping(address => uint256[]) public userChallenges;   // mapea jugador => sus challengeIds 
    mapping(bytes32 => uint256) public matches; // requests => challengeIds
    
    // definir eventos
    event NewChallenge(
        address indexed _player1,
        uint256 indexed _challengeId,
        string _gamertag1,
        string _gamertag2,
        uint256 _amount
        );
        
    event RemoveChallenge(uint256 indexed _challengeId);
    
    event ChallengeAccepted(uint256 indexed _challengeId);
    // defnir ChallengeSettled
    event ChallengeSettled(uint256 indexed _challengeId, string _winner);
    
    constructor() public {
        setPublicChainlinkToken();
        oracle = 0xdB524c2D3c2b3e75150eab9aCCDb1D25fEB51151;
        jobId = "5f1f3249d1354162a80c400dcd540dd4";
        fee = 0.1 * 10 ** 18; // 0.1 LINK
        challengeCount = 0;
    }
    
    function placeChallenge(string memory _gamertag1, string memory _gamertag2, address payable _player2, uint256 _amount) public payable returns(uint256) {
        // Sets the challenge Struct linking addresses to gamertags and bet amount with msg.value
        // Returns a challengeId and maps it to player address
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
            emit NewChallenge(msg.sender, challengeCount, _gamertag1, _gamertag2, _amount);
            return challengeCount;
    }
    
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
    
    function acceptChallenge(uint256 _challengeId) public payable {
        // updates Challenge and accepts bet amount
        require(challenges[_challengeId].player2 == msg.sender, "wrong player2");
        require(challenges[_challengeId].amount == msg.value, "wrong amount");
        challenges[_challengeId].amount = challenges[_challengeId].amount.add(msg.value);
        challenges[_challengeId].accepted = true;
        emit ChallengeAccepted(_challengeId);
        
    }
    
    function viewChallenges(address _addr) public view returns(uint256[] memory _userChallenges) {
        return userChallenges[_addr];
    }
    
    function fetchWinner(string memory _matchid, string memory _gamertag1, string memory _gamertag2, 
    uint256 _challengeId) public {
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
    
    // fulfills Chainlink Request and settles bet/challenge
     
    function fulfill(bytes32 _requestId, bytes32 _winner) public recordChainlinkFulfillment(_requestId)
    {
        // parses _result which is in the format {winner,matchId}
        
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
    
    
    function changeOracle(address _oracle, bytes32 _jobId) public onlyOwner {
        oracle = _oracle;
        jobId = _jobId;
}
   
}