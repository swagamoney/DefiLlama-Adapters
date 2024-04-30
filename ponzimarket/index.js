const ethers = require('ethers');

// Setup provider for Arbitrum
const provider = new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

// Define your parent contract's address and ABI
const parentContractAddress = "0xfcd5da8c2682e5d17235a5010a01bf6b51b2841d";
const parentContractABI = [
    "event ContractCreated(address indexed contractAddress)"
];
const parentContract = new ethers.Contract(parentContractAddress, parentContractABI, provider);

// Helper function to get all child contract addresses
async function getChildContracts() {
    const filter = parentContract.filters.ContractCreated();
    const events = await parentContract.queryFilter(filter);
    return events.map(event => event.args.contractAddress);
}

// Helper function to calculate the total balance of all child contracts
async function getTotalBalance(childContracts) {
    let totalBalance = ethers.BigNumber.from(0);
    for (let address of childContracts) {
        const balance = await provider.getBalance(address);
        totalBalance = totalBalance.add(balance);
    }
    return totalBalance;
}

// Exported TVL function
async function tvl(timestamp, ethBlock, chainBlocks) {
    const childContracts = await getChildContracts();
    const totalBalance = await getTotalBalance(childContracts);
    return {
        arbitrum: totalBalance.toString(), // Convert BigNumber to string for compatibility
    };
}

module.exports = {
    timetravel: false, // assuming no historical data is needed unless your setup supports it
    misrepresentedTokens: false, // true if there's a risk of double-counting or misrepresentation
    methodology: 'The total sum locked in all games, aggregated from the gamefactory contract that creates a new contract for each game.',
    arbitrum: {
        tvl,
    }
};
