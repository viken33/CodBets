const { config, ethers, tenderly, run } = require('hardhat');
const chalk = require('chalk');

async function main() {
  console.log(chalk.blue('verifying on etherscan'));
  await run('verify:verify', {
    address: '0x2306a4bb7d080054fd54d152210d45872541650c',
    // constructorArguments: args // If your contract has constructor arguments, you can pass them as an array
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
