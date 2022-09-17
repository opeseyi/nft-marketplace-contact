const { ethers, network } = require('hardhat');
const { moveBlock } = require('../utils/move-blocks');

const TOKEN_ID = 2;
async function cancel() {
    const nftMarketplace = await ethers.getContract('NftMarketPlace');
    const basicNft = await ethers.getContract('BasicNFT');
    const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
    await tx.wait(1);
    console.log('Nft Cancelled');

    if ((network.config.chainId = '31337')) {
        await moveBlock(2, (sleepAmount = 1000));
    }
}
cancel()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
