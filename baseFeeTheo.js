const ethers = require('ethers');
const fs = require('fs');

async function _baseFeeTheo (provider)  {
    const BASE_FEE_MAX_CHANGE_DENOMINATOR = 8;
    const ELASTICITY_MULTIPLIER = 2;
    try {
        //const provider = new ethers.providers.WebSocketProvider("wss://eth-mainnet.alchemyapi.io/v2/de9lXG44P_UXUluLpzq09506SWbTyk8-");
            const newBlock = await provider.blockNumber;
            console.log("Block number : "+newBlock)
            const content = await provider.getBlock(newBlock);

            const parent_gas_target = Math.floor(content.gasLimit / ELASTICITY_MULTIPLIER);
            const parent_gas_used = Math.floor(content.gasUsed);
            const parent_gas_basefee = Math.floor(content.baseFeePerGas);

            if(parent_gas_target == parent_gas_used) return ethers.BigNumber.from(parent_gas_basefee); //console.log((newBlock+1)+" : "+parent_gas_basefee+" if1");

            if(parent_gas_used > parent_gas_target) {
                const delta = parent_gas_used - parent_gas_target;
                const baseFeePerGasDelta = Math.max(Math.floor(Math.floor((parent_gas_basefee * delta) / parent_gas_target) / BASE_FEE_MAX_CHANGE_DENOMINATOR), 1);
                const newBaseFee = parent_gas_basefee+baseFeePerGasDelta;
                //console.log((newBlock+1)+" : "+newBaseFee+" if2");
                return ethers.BigNumber.from(newBaseFee);
            }

            if(parent_gas_used < parent_gas_target) {
                const delta = parent_gas_target - parent_gas_used;
                const baseFeePerGasDelta = Math.floor(Math.floor((parent_gas_basefee * delta) / parent_gas_target) / BASE_FEE_MAX_CHANGE_DENOMINATOR);
                const newBaseFee = parent_gas_basefee - baseFeePerGasDelta;
                //console.log((newBlock+1)+" : "+newBaseFee+" if3");
                return ethers.BigNumber.from(newBaseFee);
            }


    } catch (e) {
        console.log(e);
        return 0;
    }
}

async function baseFeeTheo(provider) {
    return await _baseFeeTheo(provider);
}
module.exports = baseFeeTheo;
/*
async function main() {
    const x = await baseFeeTheo();
    console.log(x);
}

main();
*/
    /*
    '//' is integer division round down
BASE_FEE_MAX_CHANGE_DENOMINATOR = 8;
ELASTICITY_MULTIPLIER = 2

		parent_gas_target = self.parent(block).gas_limit // ELASTICITY_MULTIPLIER
        parent_gas_limit = self.parent(block).gas_limit


		elif parent_gas_used == parent_gas_target:
			expected_base_fee_per_gas = parent_base_fee_per_gas

		elif parent_gas_used > parent_gas_target:
			gas_used_delta = parent_gas_used - parent_gas_target
			base_fee_per_gas_delta = max(parent_base_fee_per_gas * gas_used_delta // parent_gas_target // BASE_FEE_MAX_CHANGE_DENOMINATOR, 1)
			expected_base_fee_per_gas = parent_base_fee_per_gas + base_fee_per_gas_delta
      
		else:
			gas_used_delta = parent_gas_target - parent_gas_used
			base_fee_per_gas_delta = parent_base_fee_per_gas * gas_used_delta // parent_gas_target // BASE_FEE_MAX_CHANGE_DENOMINATOR
			expected_base_fee_per_gas = parent_base_fee_per_gas - base_fee_per_gas_delta
    */