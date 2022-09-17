const { ethers, network } = require('hardhat');
const { moveBlock } = require('../utils/move-blocks');

const TOKEN_ID = 3;

async function buyItem() {
    const nftMarketplace = await ethers.getContract('NftMarketPlace');
    const basicNft = await ethers.getContract('BasicNFT');
    const listing = await nftMarketplace.getListings(basicNft.address, TOKEN_ID);
    const price = listing.price.toString();
    const tx = await nftMarketplace.buyItems(basicNft.address, TOKEN_ID, { value: price });
    await tx.wait(1);
    console.log('Bought NFT');

    if ((network.config.chainId = '31337')) {
        await moveBlock(2, (sleepAmount = 1000));
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
