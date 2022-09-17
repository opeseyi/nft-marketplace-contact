const { ethers, network } = require('hardhat');
const { moveBlock } = require('../utils/move-blocks');

async function mint() {
    const basicNft = await ethers.getContract('BasicNFT');
    console.log('Mintting...');
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;
    console.log(`Got token ID:  ${tokenId}`);
    console.log(`Got contract Address:  ${basicNft.address}`);

    if ((network.config.chainId = '31337')) {
        await moveBlock(2, (sleepAmount = 1000));
    }
}

mint()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
