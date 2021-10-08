const ethers = require('ethers');
const axios = require('axios');
const fs = require('fs');
const baseFeeTheo = require('./baseFeeTheo.js')

const keys = fs.readFileSync("./keys").toString().split("\n");  //0 = compromised, 1=new

const contract_adr = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; //contract to interact with - weth9 on Goerli
const abi = ["function deposit() public payable"]; //wrap ether in wETH as an example

const GWEI = ethers.BigNumber.from(10).pow(9)
const TRANSFER_COST = ethers.BigNumber.from(21000);
const PRIORITY_FEE = GWEI.mul(15);

async function main () {
  try {

    //const provider = new ethers.providers.WebSocketProvider("wss://speedy-nodes-nyc.moralis.io/ba37a27569098467ee18fad8/eth/goerli/ws");
    //const provider = new ethers.providers.WebSocketProvider("wss://eth-mainnet.alchemyapi.io/v2/de9lXG44P_UXUluLpzq09506SWbTyk8-");
    //const provider = new ethers.providers.WebSocketProvider("wss://goerli.infura.io/ws/v3/f27398d6c6234c8692d5c058b817d69b");
    //const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/f27398d6c6234c8692d5c058b817d69b");
    const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.alchemyapi.io/v2/CRqN64U3_e0YGBuQyTzWZeN8v1vX0DOp");
    
    const BAD_adr_sig = new ethers.Wallet(keys[0], provider);
    const new_adr_sig = new ethers.Wallet(keys[1], provider);
    const contract_interface = new ethers.Contract(contract_adr, abi, BAD_adr_sig);

    console.log("Compromised address : "+await BAD_adr_sig.getAddress());
    console.log("Safe address : "+await new_adr_sig.getAddress());
    console.log("Contract address : "+contract_interface.address);
    
    console.log("Internal kitchen: turning on the gas");
    const gasEstimation = await contract_interface.estimateGas.deposit({value: ethers.utils.parseEther('0.1')});
    console.log("-- contract interaction (estim):"+gasEstimation.toString());
    console.log("-- simple tx: 21000");
    console.log("Next basefee computation:")
    const [block, estim] = await baseFeeTheo(provider);
    const baseFee = estim.toNumber();
    const newBlock = provider.blockNumber;
    let content = await provider.getBlock(newBlock);
    let gasLim = content.gasLimit.toNumber();
    console.log("block : "+block+" is coming - theo basefee : "+estim.toString());
    console.log("gas limit : "+gasLim);


    //only mainnet :/
    //const resGas = await axios.get('https://api.blocknative.com/gasprices/blockprices', {headers: {"Authorization": "API-KEY"}})
    //console.log(resGas.data.blockPrices);

    //max theo baseFee = prev * 112.5%
    //max theo fee = 2*base + priority

    console.log("crafting delicious payloads:")

    const first = {
      to: BAD_adr_sig.address,
      value: ethers.utils.parseEther('0.1'),
      from: new_adr_sig.address,
      type: 2,
      maxPriorityFeePerGas: GWEI.mul(15)+2,
      maxFeePerGas: GWEI.mul(20)+baseFee+2,
      data: '0x'
    };

    const payloadData = contract_interface.interface.encodeFunctionData('deposit', []);

    const second = {
      to: contract_interface.address,
      value: ethers.utils.parseEther('0.1'),
      from: BAD_adr_sig.address,
      type: 2,
      maxPriorityFeePerGas: GWEI.mul(20)+1,
      maxFeePerGas: GWEI.mul(20)+baseFee+1,
      data: payloadData
    };

    const third = {
      to: new_adr_sig.address,
      value: ethers.utils.parseEther('0.1'),
      from: BAD_adr_sig.address,
      type: 2,
      maxPriorityFeePerGas: GWEI.mul(20),
      maxFeePerGas: GWEI.mul(20)+baseFee,
      data: '0x'
    };

   const [first_tx, second_tx, third_tx] = await Promise.all([await new_adr_sig.sendTransaction(first), await BAD_adr_sig.sendTransaction(second), await BAD_adr_sig.sendTransaction(third)]);
   console.log("waiting for the tx to get cooked by miner");
   console.log(await first_tx.wait());
   console.log(await second_tx.wait());
   console.log(await third_tx.wait());
   console.log("------------------");

    return process.exit(0);
  } catch (e) {
    console.log(e);
    return process.exit(-1);
  }
}

main();


process.on('exit', function(code) {
  return console.log(`Exit with code ${code}`);
});