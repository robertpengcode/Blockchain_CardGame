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
    uint256 public constant Berserk = 8;
    uint256 public constant ForceShield = 9;

    uint256 public constant characterPrice = 0.001 ether;
    uint256 public constant treasurePrice = 0.0002 ether;
    uint256 public constant battlePrice = 0.001 ether;
    uint256 public constant winnerPrize = 0.0018 ether;
    //battleId starts from 1
    uint256 private lastBattleId = 1;

    struct Token {
        string name;
        uint8 attack;
        uint8 defense;
    }

    struct Player {
        string name;
        address playerAddr;
        uint256 battleTimes;
        uint8 health;
        uint8 energy;
        //[characterId, treasureId1, treasureId2]
        uint256[3] battleTokens;
        uint8 battleAttack;
        uint8 battleDefense;
        uint8 battleMoveId;
    }

    struct Battle {
        Player[2] playersInBattle;
        address winner;
        BattleStatus battleStatus;
        Choice[2] moves;
    }

    enum BattleStatus {
        PENDING,
        STARTED,
        ENDED
    }

    enum Choice {
        NO,
        ATTACK,
        DEFENSE
    }

    //battles waiting for player to join
    uint256[] private waitingBattleIds;
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

    event RegisteredPlayer(string name, address indexed playerAddr, uint256 time);
    event StartedBattle(uint256 indexed battleId, address indexed player1, address indexed player2, uint256 time);
    event EndedBattle(uint256 indexed battleId, address indexed winner, uint256 time);

    error CardBattle__IsPlayerAlready();
    error CardBattle__NotPlayer();
    error CardBattle__SentWrongValue();
    error CardBattle__NeedToBuyBattles();
    error CardBattle__OwnNoCharacter();
    error CardBattle__OwnNoSuchTreasure();
    error CardBattle__NeedToJoinBattles();
    error CardBattle__NeedToInitiateBattle();
    error CardBattle__StatusNotCorrect();

    modifier isNotPlayer() {
        if(players[msg.sender].playerAddr != address(0)) {
            revert CardBattle__IsPlayerAlready();
        }
        _;
    }

    modifier playerOnly() {
        if(players[msg.sender].playerAddr == address(0)) {
            revert CardBattle__NotPlayer();
        }
        _;
    }
//[["empty", 0, 0],["Jeff", 8, 2],["Charlie", 7, 3],["Henley", 7, 3],["Jack", 6, 4],["Bob", 6, 4],["Sophie", 5, 5],["Steve", 5, 5],["Berserk", 1, 0],["ForceShield", 0, 1]]
    constructor(Token[] memory tokensArr) ERC1155("https://github.com/robertpengcode/Blockchain_CardGame/tree/main/backend/metadata/{id}.json") {
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
        players[msg.sender].name = name;
        players[msg.sender].playerAddr = msg.sender;
        players[msg.sender].health = 10;
        players[msg.sender].energy = 10;
        emit RegisteredPlayer(name, msg.sender, block.timestamp);
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

    function useMagicSword() external playerOnly{
        if (ownedTokens[msg.sender][Berserk] <= 0){
            revert CardBattle__OwnNoSuchTreasure();
        } 
        ownedTokens[msg.sender][Berserk]--;
        _burn(msg.sender, Berserk, 1);
        players[msg.sender].battleTokens[1] = Berserk;
    }

     function useMagicShield() external playerOnly{
        if (ownedTokens[msg.sender][ForceShield] <= 0){
            revert CardBattle__OwnNoSuchTreasure();
        } 
        ownedTokens[msg.sender][ForceShield]--;
        _burn(msg.sender, ForceShield, 1);
        players[msg.sender].battleTokens[2] = ForceShield;
    }

    function playGame() external playerOnly{
        if (waitingBattleIds.length == 0) {
            _initiateBattle();
        } else {
            _joinBattle();
        }
    }

    function _initiateBattle() internal playerOnly{
        if (players[msg.sender].battleTimes <= 0) {
            revert CardBattle__NeedToBuyBattles();
        }
        if (waitingBattleIds.length != 0) {
            revert CardBattle__NeedToJoinBattles();
        }
        players[msg.sender].battleTimes--;
        uint256 characterId = players[msg.sender].battleTokens[0];
        uint256 treasureId1 = players[msg.sender].battleTokens[1];
        uint256 treasureId2 = players[msg.sender].battleTokens[2];
        players[msg.sender].battleAttack = tokens[characterId].attack + tokens[treasureId1].attack;
        players[msg.sender].battleDefense = tokens[characterId].defense + tokens[treasureId2].defense;
        players[msg.sender].battleMoveId = 0;
        uint256 battleId = lastBattleId;
        lastBattleId++;
        battles[battleId].playersInBattle[0] = players[msg.sender];
        waitingBattleIds.push(battleId);
    }

    function _joinBattle() internal playerOnly{
        if (players[msg.sender].battleTimes <= 0) {
            revert CardBattle__NeedToBuyBattles();
        }
        if (waitingBattleIds.length == 0) {
            revert CardBattle__NeedToInitiateBattle();
        }
        uint256 battleId = waitingBattleIds[0];
        address player1 = battles[battleId].playersInBattle[0].playerAddr;
        delete waitingBattleIds;
        players[msg.sender].battleTimes--;
        uint256 characterId = players[msg.sender].battleTokens[0];
        uint256 treasureId1 = players[msg.sender].battleTokens[1];
        uint256 treasureId2 = players[msg.sender].battleTokens[2];
        players[msg.sender].battleAttack = tokens[characterId].attack + tokens[treasureId1].attack;
        players[msg.sender].battleDefense = tokens[characterId].defense + tokens[treasureId2].defense;
        players[msg.sender].battleMoveId = 1;
        battles[battleId].playersInBattle[1] = players[msg.sender];
        battles[battleId].battleStatus = BattleStatus.STARTED;
        emit StartedBattle(battleId, player1, msg.sender, block.timestamp);
    }

    function makeMove(uint256 battleId, Choice choice) external playerOnly{
        if (battles[battleId].battleStatus != BattleStatus.STARTED) {
            revert CardBattle__StatusNotCorrect();
        }
        uint8 battleMoveId = players[msg.sender].battleMoveId;
        battles[battleId].moves[battleMoveId] = choice;
        if (battles[battleId].moves[0] != Choice.NO && battles[battleId].moves[1] != Choice.NO) {
            _updateGame(battleId);
        }
    }

    function _updateGame(uint256 battleId) internal {
        Player memory player1 = battles[battleId].playersInBattle[0];
        Player memory player2 = battles[battleId].playersInBattle[1];
        Choice move1 = battles[battleId].moves[0]; 
        Choice move2 = battles[battleId].moves[1]; 
        if (move1 == Choice.ATTACK && move2 == Choice.ATTACK) {
            player1.health = player1.health - player2.battleAttack;
            player2.health = player2.health - player1.battleAttack;
            if (player1.health > 0 && player2.health <= 0) {
                battles[battleId].winner = player1.playerAddr;
                _endBattle(battleId);
            } else if (player1.health <= 0 && player2.health > 0) {
                battles[battleId].winner = player2.playerAddr;
                _endBattle(battleId);
            } else if (player1.health <= 0 && player2.health <= 0) {
                _endBattle(battleId);
            }
            player1.energy -= 2;
            player2.energy -= 2;
            if (player1.energy == 0) {
                if (player1.health > player2.health) {
                    battles[battleId].winner = player1.playerAddr;
                    _endBattle(battleId);
                } else if (player1.health < player2.health) {
                    battles[battleId].winner = player2.playerAddr;
                    _endBattle(battleId);
                }
                _endBattle(battleId);
            }
        } else if(move1 == Choice.ATTACK && move2 == Choice.DEFENSE) {
            player2.health = player2.health - player1.battleAttack + player2.battleDefense;
            if (player1.health > 0 && player2.health <= 0) {
                battles[battleId].winner = player1.playerAddr;
                _endBattle(battleId);
            } else if (player1.health <= 0 && player2.health > 0) {
                battles[battleId].winner = player2.playerAddr;
                _endBattle(battleId);
            } else if (player1.health <= 0 && player2.health <= 0) {
                _endBattle(battleId);
            }
            player1.energy -= 2;
            player2.energy -= 2;
            if (player1.energy == 0) {
                if (player1.health > player2.health) {
                    battles[battleId].winner = player1.playerAddr;
                    _endBattle(battleId);
                } else if (player1.health < player2.health) {
                    battles[battleId].winner = player2.playerAddr;
                    _endBattle(battleId);
                }
                _endBattle(battleId);
            }
        } else if(move1 == Choice.DEFENSE && move2 == Choice.ATTACK) {
            player1.health = player1.health - player2.battleAttack + player1.battleDefense;
            if (player1.health > 0 && player2.health <= 0) {
                battles[battleId].winner = player1.playerAddr;
                _endBattle(battleId);
            } else if (player1.health <= 0 && player2.health > 0) {
                battles[battleId].winner = player2.playerAddr;
                _endBattle(battleId);
            } else if (player1.health <= 0 && player2.health <= 0) {
                _endBattle(battleId);
            }
            player1.energy -= 2;
            player2.energy -= 2;
            if (player1.energy == 0) {
                if (player1.health > player2.health) {
                    battles[battleId].winner = player1.playerAddr;
                    _endBattle(battleId);
                } else if (player1.health < player2.health) {
                    battles[battleId].winner = player2.playerAddr;
                    _endBattle(battleId);
                }
                _endBattle(battleId);
            }
        } else if(move1 == Choice.DEFENSE && move2 == Choice.DEFENSE) {
            player1.energy -= 2;
            player2.energy -= 2;
            if (player1.energy == 0) {
                if (player1.health > player2.health) {
                    battles[battleId].winner = player1.playerAddr;
                    _endBattle(battleId);
                } else if (player1.health < player2.health) {
                    battles[battleId].winner = player2.playerAddr;
                    _endBattle(battleId);
                }
                _endBattle(battleId);
            }
        }
    }

    function _endBattle(uint256 battleId) internal {
        address winner = battles[battleId].winner;
        battles[battleId].battleStatus = BattleStatus.ENDED;
        emit EndedBattle(battleId, winner, block.timestamp);
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

    function getBattleStatus(uint256 battleId) public view returns (BattleStatus) {
        return battles[battleId].battleStatus;
    }

    function getWaitingBattle() public view returns (uint256[] memory) {
        return waitingBattleIds;
    }
}
