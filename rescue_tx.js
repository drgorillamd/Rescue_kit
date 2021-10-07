const ethers = require('ethers');
const axios = require('axios');
const fs = require('fs');
const keys = fs.readFileSync("./keys").toString().split("\n");  //0 = compromised, 1=new
const WS_SERVER = 'wss://speedy-nodes-nyc.moralis.io/ba37a27569098467ee18fad8/bsc/mainnet/ws';

const contract_adr = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; //contract to interact with - weth9 on Goerli
const abi = ["function deposit() public payable"]; //wrap ether in wETH as an example


async function main () {

  try {

    const provider = new ethers.providers.WebSocketProvider("wss://speedy-nodes-nyc.moralis.io/ba37a27569098467ee18fad8/eth/goerli/ws");
    
    const BAD_adr_sig = new ethers.Wallet(keys[0], provider);
    const new_adr_sig = new ethers.Wallet(keys[1], provider);
    const contract_interface = new ethers.Contract(contract_adr, abi, new_adr_sig);

    console.log("Compromised address : "+BAD_adr_sig.address);
    console.log("Safe address : "+new_adr_sig.address);
    console.log("Contract address : "+contract_interface.address);
    

    console.log("Internal kitchen: turning on the gas");
    const gasEstimation = await contract_interface.estimateGas.deposit({value: ethers.utils.parseEther('1')});
    console.log("-- contract interaction:"+gasEstimation.toString());
    console.log("-- simple tx: 21000");
    console.log("Getting blocknative breadcrumbs for gas estimate")

    //only mainnet :/
    //const resGas = await axios.get('https://api.blocknative.com/gasprices/blockprices', {headers: {"Authorization": "API-KEY"}})
    //console.log(resGas.data.blockPrices);
    console.log("crafting delicious payloads:")

    let initPriorityFee;

/*

  const sendEthBadAdr = {
    to: BAD_adr.address,
    value: ethers.utils.parseEthers(1),
    from: new_adr.address,
    nonce: nonce,// You need to Get this using web3.eth.getTransactionCount
    gasLimit: gasLimit, // Get this by web3.eth.estimateGas
    gasPrice: gasPrice // use, web3.eth.gasPrice
   };

   const result = await new_adr.sendTransaction(sendEthBadAdr)

   var rawTx = {
    to: "<to_address>",
    data: payloadData,
    value: '0x0',
    from: "<from_address>",
    nonce: nonce,// You need to Get this using web3.eth.getTransactionCount
    //gasLimit: gasLimit, // Get this by web3.eth.estimateGas
    //gasPrice: gasPrice, // use, web3.eth.gasPrice
    maxPriorityFeePerGas: ethers.utils.parseEthers(0.01)
   };





  await t.methods.transferFrom(MULTISIG_ADR, RECEIVER[i], to_send).send({from: addresse[0], gas:1000000});
  console.log("Sending "+to_send+" to "+RECEIVER[i]);



    var payloadData = contract.functionName.getData(functionParameters);

    var rawTx = {
    to: "<to_address>",
    data: payloadData,
    value: '0x0',
    from: "<from_address>",
    nonce: nonce,// You need to Get this using web3.eth.getTransactionCount
    gasLimit: gasLimit, // Get this by web3.eth.estimateGas
    gasPrice: gasPrice // use, web3.eth.gasPrice
   };
   
    var result = web3.eth.sendTransaction(rawTx);


    let bal = await t.methods.balanceOf(RECEIVER[i]).call();
    console.log(RECEIVER[i]+" : "+(bal/10**9).toString());


    const bal = await t.methods.balanceOf(MULTISIG_ADR).call();
*/

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