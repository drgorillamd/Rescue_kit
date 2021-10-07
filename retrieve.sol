
pragma solidity ^0.8.0;
    
contract retrieve {
    constructor () {
        address sender = msg.sender;
        sender.call{value: address(this).balance}('');
    }
}
