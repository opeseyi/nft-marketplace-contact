const { network } = require('hardhat');

function sleep(timeInt) {
    return new Promise((resolve) => setTimeout(resolve, timeInt));
}
async function moveBlock(amount, sleepAmount = 0) {
    console.log('Moving blocks...');
    for (let i = 0; i < amount; i++) {
        await network.provider.request({
            method: 'evm_mine',
            params: [],
        });
        if (sleepAmount) {
            console.log(`Sleeping for ${sleepAmount}`);
            await sleep(sleepAmount);
        }
    }
}

module.exports = {
    moveBlock,
    sleep,
};
