const { network, getNamedAccounts, deployments } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log('...................................................');
  const args = [];

  const basicNfts = await deploy('BasicNFT', {
    from: deployer,
    ars: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Veryfing...');
    await verify(basicNfts.address, args);
  }
  log('...................................................');
};

module.exports.tags = ['all', 'basicnft'];
