const {network} = require('hardhat')
const {developmentChains, networkConfig} = require('../helper-hardhat-config.js')
const {verify} = require('../utils/verify')
require('dotenv').config()

module.exports = async function main({getNamedAccounts, deployments}){
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log('...................................................');

    let args = []

    const nftMaketplace = await deploy('NftMarketPlace',{
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1 
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log('Verifying........')
        await verify(NftMarketPlace.address, args)
    }

    log('...................................................');
}

module.exports.tags = ['all', 'nftMarketplace'];

