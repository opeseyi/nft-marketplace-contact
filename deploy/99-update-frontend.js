const { ethers, network } = require('hardhat');
const fs = require('fs');

const frontEndContractFile = '../next-moralis-marketplace/constants/networkMapping.json';
const frontEndAbiLocation= '../next-moralis-marketplace/constants/';

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log('Updating frontend');

        await updateContractAddresses();
        await updateAbi()
    }
};

async function updateAbi(){
    const nftMarketplace = await ethers.getContract('NftMarketPlace');

    const chainId = network.config.chainId.toString();

    fs.writeFileSync(`${frontEndAbiLocation}NftMarketplace.json`, nftMarketplace.interface.format(ethers.utils.FormatTypes.json))
    
    const basicNft = await ethers.getContract('BasicNFT')
    fs.writeFileSync(`${frontEndAbiLocation}BasicNft.json`, basicNft.interface.format(ethers.utils.FormatTypes.json))


}

async function updateContractAddresses() {
    const nftMarketPlace = await ethers.getContract('NftMarketPlace');

    const chainId = network.config.chainId.toString();
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractFile, 'utf8'));

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]['NftMarketPlace'].includes(nftMarketPlace.address)) {
            contractAddresses[chainId]['NftMarketPlace'].push(nftMarketPlace.address);
        }
    } else {
        contractAddresses[chainId] = { NftMarketPlace: [nftMarketPlace.address] };
    }

    fs.writeFileSync(frontEndContractFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ['all', 'frontend'];
