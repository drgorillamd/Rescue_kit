const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const tmp = fs.readFileSync("/home/drgorilla/Documents/solidity/.private_key_testnet").toString();
const sender = [tmp];
const RPC_SERVER = 'https://bsc-dataseed.binance.org/';


async function fake_tx() {

  const provider = new Provider(sender, RPC_SERVER);
  const web3 = new Web3(provider);

  for (let i = 0; i < 322; i++) {
    console.log("sending tx "+i);
    web3.eth.sendTransaction({from:provider.addresses[0], to:provider.addresses[0], value: 0});
    console.log("---------------");
  }

}

fake_tx();
