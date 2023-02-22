const { network } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  if (chainId == 31337) {
    log("Local network detected! Deploying to a local network...");
  }
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");

  const gameTokens = await deploy("GameTokens", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

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
  const gameTokensAddress = gameTokens.address;
  const arguments = [tokensArr, gameTokensAddress];
  const cardBattle = await deploy("CardBattle", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(gameTokens.address, []);
    await verify(cardBattle.address, arguments);
  }
  log("----------------------------------------------------");
};
module.exports.tags = ["CardBattle"];
