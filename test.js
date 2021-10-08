const ethers = require('ethers');

const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.alchemyapi.io/v2/CRqN64U3_e0YGBuQyTzWZeN8v1vX0DOp");
const wallet = new ethers.Wallet('0x99544a6e1848f07f14f089bd26f93aabe8bb69d825f86a415567aa2a644a975c', provider);

async function main() {

const payload = {
    to: '0x8D5bB23Ca45850402C546D748A40C521CdcE713c',
    value: ethers.utils.parseEther('0.1'),
};

const first_tx = await wallet.sendTransaction(payload);
console.log(await first_tx.wait());
}

main();