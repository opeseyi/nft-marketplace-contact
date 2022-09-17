const {moveBlock} = require('../utils/move-blocks')

const BLOCK = 2
const SLEEP_AMOUNT = 1000

async function mine(){
    await moveBlock(BLOCK, (sleepAmount = SLEEP_AMOUNT))
}

mine()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
