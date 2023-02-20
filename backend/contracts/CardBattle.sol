// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CardBattle is ERC1155, Ownable {
    //set up ERC1155 tokenIds from 1 to 9
    uint256 public constant Jeff = 1;
    uint256 public constant Charlie = 2;
    uint256 public constant Henley = 3;
    uint256 public constant Jack = 4;
    uint256 public constant Bob = 5;
    uint256 public constant Sophie = 6;
    uint256 public constant Steve = 7;
    uint256 public constant MagicSword = 8;
    uint256 public constant MagicShield = 9;

    uint256 public constant characterPrice = 0.001 ether;
    uint256 public constant treasurePrice = 0.0002 ether;
    uint256 public constant battlePrice = 0.001 ether;
    uint256 public constant winnerPrize = 0.0018 ether;
    //battleId starts from 1
    uint256 private lastBattleId = 1;
    //playerId starts from 1
    uint256 private lastPlayerId = 1;

    struct Token {
        string name;
        uint8 attack;
        uint8 defense;
    }

    struct Player {
        string name;
        uint256 playerId;
        address playerAddr;
        uint256 battleTimes;
        uint8 health;
        uint8 energy;
        //[characterId, treasureId1, treasureId2]
        uint256[3] battleTokens;
        uint8 battleAttack;
        uint8 battleDefense;
    }

    struct Battle {
        Player[2] playersInBattle;
        address winner;
    }

    struct Move {
        Player player;
        Choice choice;
    }

    enum BattleStatus {
        PENDING,
        START,
        END
    }

    enum Choice {
        ATTACK,
        DEFENSE
    }

    //user address to a Player struct
    mapping(address => Player) private players;
    //user address to tokenId to owned amount
    mapping(address => mapping(uint256 => uint256)) private ownedTokens;
    //battleId to a Battle struct
    mapping(uint256 => Battle) private battles;
    //tokenId to token struct
    mapping(uint256 => Token) private tokens;
    //user address to ether balance
    mapping(address => uint256) private playerBalances;

    event RegisteredPlayer(string name, uint256 indexed playerId, address indexed playerAddr, uint256 time);

    error CardBattle__IsPlayerAlready();
    error CardBattle__NotPlayer();
    error CardBattle__SentWrongValue();
    error CardBattle__NeedToBuyBattles();
    error CardBattle__OwnNoCharacter();
    error CardBattle__OwnNoSuchTreasure();

    modifier isNotPlayer() {
        if(players[msg.sender].playerId != 0) {
            revert CardBattle__IsPlayerAlready();
        }
        _;
    }

    modifier playerOnly() {
        if(players[msg.sender].playerId == 0) {
            revert CardBattle__NotPlayer();
        }
        _;
    }
//[["empty", 0, 0],["Jeff", 8, 2],["Charlie", 7, 3],["Henley", 6, 4],["Jack", 5, 5],["Bob", 4, 6],["Sophie", 3, 7],["Steve", 2, 8],["MagicSword", 1, 0],["MagicShield", 0, 1]]
    constructor(Token[] memory tokensArr) ERC1155("") {
        _setUpTokens(tokensArr);
    }

    function _setUpTokens(Token[] memory tokensArr) internal {
        for (uint8 i = 0; i <tokensArr.length; i++) {
            tokens[i].name = tokensArr[i].name;
            tokens[i].attack = tokensArr[i].attack;
            tokens[i].defense = tokensArr[i].defense;
        }
    }

    function registerPlayer(string calldata name) external isNotPlayer{
        uint256 playerId = lastPlayerId;
        lastPlayerId++;
        players[msg.sender].name = name;
        players[msg.sender].playerId = playerId;
        players[msg.sender].playerAddr = msg.sender;
        players[msg.sender].health = 10;
        players[msg.sender].energy = 10;
        emit RegisteredPlayer(name, playerId, msg.sender, block.timestamp);
    }

    function mintCharacter() external payable playerOnly{
        if (msg.value != characterPrice) {
            revert CardBattle__SentWrongValue();
        }
        uint256 characterId = _createRandomNum(7, msg.sender);
        _mint(msg.sender, characterId, 1, "");
    }

    function mintTreasure(uint256 treasureId, uint256 amount) external payable playerOnly{
        if (msg.value != treasurePrice * amount) {
            revert CardBattle__SentWrongValue();
        }
        _mint(msg.sender, treasureId, amount, "");
    }

    function buyBattles(uint256 amount) external payable playerOnly{
        if (msg.value != battlePrice * amount) {
            revert CardBattle__SentWrongValue();
        }
        players[msg.sender].battleTimes += amount;
    }

    function pickCharacter(uint256 characterId) external playerOnly{
        if (ownedTokens[msg.sender][characterId] <= 0){
            revert CardBattle__OwnNoCharacter();
        } 
        players[msg.sender].battleTokens[0] = characterId;
    }

    function useTreasure1(uint256 treasureId1) external playerOnly{
        if (ownedTokens[msg.sender][treasureId1] <= 0){
            revert CardBattle__OwnNoSuchTreasure();
        } 
        ownedTokens[msg.sender][treasureId1]--;
        _burn(msg.sender, treasureId1, 1);
        players[msg.sender].battleTokens[1] = treasureId1;
    }

     function useTreasure2(uint256 treasureId2) external playerOnly{
        if (ownedTokens[msg.sender][treasureId2] <= 0){
            revert CardBattle__OwnNoSuchTreasure();
        } 
        ownedTokens[msg.sender][treasureId2]--;
        _burn(msg.sender, treasureId2, 1);
        players[msg.sender].battleTokens[2] = treasureId2;
    }

    function initiateBattle() external payable playerOnly{
        if (players[msg.sender].battleTimes <= 0) {
            revert CardBattle__NeedToBuyBattles();
        }
        players[msg.sender].battleTimes--;
        uint256 characterId = players[msg.sender].battleTokens[0];
        uint256 treasureId1 = players[msg.sender].battleTokens[1];
        uint256 treasureId2 = players[msg.sender].battleTokens[2];
        players[msg.sender].battleAttack = tokens[characterId].attack + tokens[treasureId1].attack;
        players[msg.sender].battleDefense = tokens[characterId].defense + tokens[treasureId2].defense;
        uint256 battleId = lastBattleId;
        lastBattleId++;
        battles[battleId].playersInBattle[0] = players[msg.sender];
    }

    function joinBattle(uint256 battleId) external playerOnly{
        if (players[msg.sender].battleTimes <= 0) {
            revert CardBattle__NeedToBuyBattles();
        }
        players[msg.sender].battleTimes--;
        battles[battleId].playersInBattle[1] = players[msg.sender];
    }

    function makeMove(uint256 battleId, Choice choice) external playerOnly{

    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    //internal function to generate a random number
    function _createRandomNum(uint256 _max, address _sender) internal view returns (uint256 randomValue) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, _sender)));
        randomValue = randomNum % _max;
        //we want it from 1 to _max
        return randomValue + 1;
    }

    function getToken(uint256 tokenId) public view returns (Token memory){
        return tokens[tokenId];
    }

    function getPlayer(address playerAddr) public view returns (Player memory){
        return players[playerAddr];
    }

    function getBattle(uint256 battleId) public view returns (Battle memory) {
        return battles[battleId];
    }

}
