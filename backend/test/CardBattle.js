const { expect } = require("chai");
const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("CardBattle", function () {
      let owner, player1, player2, player3, cardBattle, gameTokens;
      const characterPrice = ethers.utils.parseEther("0.001");
      const treasurePrice = ethers.utils.parseEther("0.0002");
      let player1_characterId, player2_characterId;
      before(async () => {
        [owner, player1, player2, player3] = await ethers.getSigners();

        const GameTokens = await ethers.getContractFactory("GameTokens");
        gameTokens = await GameTokens.deploy();
        await gameTokens.deployed();

        const tokensArr = [
          [0, 0],
          [8, 2],
          [7, 3],
          [7, 3],
          [6, 4],
          [6, 4],
          [5, 5],
          [5, 5],
          [1, 0],
          [0, 1],
        ];

        const CardBattle = await ethers.getContractFactory("CardBattle");
        cardBattle = await CardBattle.deploy(tokensArr, gameTokens.address);
        await cardBattle.deployed();
      });

      describe("Deployment", function () {
        it("Should set the right owner", async () => {
          expect(await gameTokens.owner()).to.equal(owner.address);
          expect(await cardBattle.owner()).to.equal(owner.address);
        });

        it("Should set tokens in the game", async () => {
          expect((await cardBattle.getToken(1)).attack).to.equal(8);
        });

        it("Should set game token contract address", async () => {
          expect(await cardBattle.gameTokensContract()).to.equal(
            gameTokens.address
          );
        });
      });

      describe("Register Player", function () {
        it("Should register player - event RegisteredPlayer", async () => {
          await expect(cardBattle.connect(player1).registerPlayer()).to.emit(
            cardBattle,
            "RegisteredPlayer"
          );
        });
        it("Should be in players mapping", async () => {
          expect(
            (await cardBattle.getPlayer(player1.address)).playerAddr
          ).to.equal(player1.address);
        });
        it("Should not register player - registered already", async () => {
          await expect(
            cardBattle.connect(player1).registerPlayer()
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__IsPlayerAlready"
          );
        });
        it("Should register player2 - event RegisteredPlayer", async () => {
          await expect(cardBattle.connect(player2).registerPlayer()).to.emit(
            cardBattle,
            "RegisteredPlayer"
          );
        });
      });

      describe("Mint Character", function () {
        it("Should not mint character - not player", async () => {
          await expect(
            cardBattle.connect(player3).mintCharacter({ value: characterPrice })
          ).to.be.revertedWithCustomError(cardBattle, "CardBattle__NotPlayer");
        });
        it("Should not mint character - wrong value", async () => {
          await expect(
            cardBattle.connect(player1).mintCharacter({ value: 0 })
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__SentWrongValue"
          );
        });
        it("Should mint character - event MintedCharacter", async () => {
          await expect(
            cardBattle.connect(player1).mintCharacter({ value: characterPrice })
          ).to.emit(cardBattle, "MintedCharacter");
        });

        it("Should update player's token balance", async () => {
          player1_characterId = await cardBattle.getLastMintedChar();
          expect(
            (
              await gameTokens.balanceOf(player1.address, player1_characterId)
            ).toString()
          ).to.equal("1");
          expect(
            (
              await cardBattle.getOwnedTokenAmount(
                player1.address,
                player1_characterId
              )
            ).toString()
          ).to.equal("1");
        });

        it("Should update ETH balances", async () => {
          await expect(
            cardBattle.connect(player2).mintCharacter({ value: characterPrice })
          ).to.changeEtherBalances(
            [cardBattle.address, player2.address],
            [characterPrice, -characterPrice]
          );
        });
      });

      describe("Mint Treasure", function () {
        const mintAmount = 1;
        const treasureId = 8;
        it("Should not mint treasure - not player", async () => {
          await expect(
            cardBattle.connect(player3).mintTreasure(treasureId, mintAmount, {
              value: treasurePrice * mintAmount,
            })
          ).to.be.revertedWithCustomError(cardBattle, "CardBattle__NotPlayer");
        });

        it("Should not mint treasure - wrong value", async () => {
          await expect(
            cardBattle.connect(player1).mintTreasure(treasureId, mintAmount, {
              value: 0,
            })
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__SentWrongValue"
          );
        });

        it("Should mint treasure - event MintedTreasure", async () => {
          await expect(
            cardBattle.connect(player1).mintTreasure(treasureId, mintAmount, {
              value: treasurePrice * mintAmount,
            })
          ).to.emit(cardBattle, "MintedTreasure");
        });

        it("Should update ETH balance", async () => {
          await expect(
            cardBattle.connect(player1).mintTreasure(treasureId, mintAmount, {
              value: treasurePrice * mintAmount,
            })
          ).to.changeEtherBalances(
            [cardBattle.address, player1.address],
            [treasurePrice * mintAmount, -treasurePrice * mintAmount]
          );
        });

        it("Should update player's token balance", async () => {
          expect(
            (await gameTokens.balanceOf(player1.address, treasureId)).toString()
          ).to.equal("2");
          expect(
            (
              await cardBattle.getOwnedTokenAmount(player1.address, treasureId)
            ).toString()
          ).to.equal("2");
        });
      });

      describe("Pick Character", function () {
        //let tokenId;
        let anotherId;
        before(async () => {
          anotherId =
            player1_characterId - 1 === 0
              ? player1_characterId + 1
              : player1_characterId - 1;
          player2_characterId = await cardBattle.getLastMintedChar();
        });

        it("Should not pick Character - not player", async () => {
          await expect(
            cardBattle.connect(player3).pickCharacter(player1_characterId)
          ).to.be.revertedWithCustomError(cardBattle, "CardBattle__NotPlayer");
        });

        it("Should pick character - event PickedCharacter", async () => {
          await expect(
            cardBattle.connect(player1).pickCharacter(player1_characterId)
          ).to.emit(cardBattle, "PickedCharacter");
        });

        it("Should not pick Character - no balance", async () => {
          await expect(
            cardBattle.connect(player1).pickCharacter(anotherId)
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__OwnNoCharacter"
          );
        });

        it("Should update player info", async () => {
          expect(
            (await cardBattle.getPlayer(player1.address)).battleTokens[0]
          ).to.be.equal(player1_characterId);
        });
      });

      describe("Use Berserk", function () {
        const tokenId = 8;
        it("Should not use Berserk - not player", async () => {
          await expect(
            cardBattle.connect(player3).useBerserk()
          ).to.be.revertedWithCustomError(cardBattle, "CardBattle__NotPlayer");
        });

        it("Should not use Berserk - no balance", async () => {
          await expect(
            cardBattle.connect(player2).useBerserk()
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__OwnNoSuchTreasure"
          );
        });

        it("Should use Berserk - event UsedBerserk", async () => {
          await expect(cardBattle.connect(player1).useBerserk()).to.emit(
            cardBattle,
            "UsedBerserk"
          );
        });

        it("Should update player info", async () => {
          expect(
            (await cardBattle.getPlayer(player1.address)).battleTokens[1]
          ).to.be.equal(tokenId);
        });
      });

      describe("Use ForceShield", function () {
        const tokenId = 9;
        const mintAmount = 2;
        before(async () => {
          await cardBattle.connect(player2).mintTreasure(tokenId, mintAmount, {
            value: treasurePrice * mintAmount,
          });
        });

        it("Should not use ForceShield - not player", async () => {
          await expect(
            cardBattle.connect(player3).useForceShield()
          ).to.be.revertedWithCustomError(cardBattle, "CardBattle__NotPlayer");
        });

        it("Should not use ForceShield - no balance", async () => {
          await expect(
            cardBattle.connect(player1).useForceShield()
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__OwnNoSuchTreasure"
          );
        });

        it("Should use ForceShield - event UsedForceShield", async () => {
          await expect(cardBattle.connect(player2).useForceShield()).to.emit(
            cardBattle,
            "UsedForceShield"
          );
        });

        it("Should update player info", async () => {
          expect(
            (await cardBattle.getPlayer(player2.address)).battleTokens[2]
          ).to.be.equal(tokenId);
        });
      });

      describe("Play Game", function () {
        it("Should not play - not player", async () => {
          await expect(
            cardBattle.connect(player3).playGame()
          ).to.be.revertedWithCustomError(cardBattle, "CardBattle__NotPlayer");
        });
        it("Should play (initiate battle) - event InitiatedBattle", async () => {
          await expect(cardBattle.connect(player1).playGame()).to.emit(
            cardBattle,
            "InitiatedBattle"
          );
        });
        it("Should not play - in game already", async () => {
          await expect(
            cardBattle.connect(player1).playGame()
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__InGameAlready"
          );
        });
        it("Should play (join battle) - event StartedBattle", async () => {
          await expect(cardBattle.connect(player2).playGame()).to.emit(
            cardBattle,
            "StartedBattle"
          );
        });
        it("Should not play (initiate battle) - Require Character To Play", async () => {
          await cardBattle.connect(player3).registerPlayer();
          await expect(
            cardBattle.connect(player3).playGame()
          ).to.be.revertedWithCustomError(
            cardBattle,
            "CardBattle__RequireCharacterToPlay"
          );
        });
      });
    });
