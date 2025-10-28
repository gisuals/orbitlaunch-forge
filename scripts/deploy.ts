const hre = require("hardhat");

async function main() {
  console.log("Deploying OrbitLaunchRegistry to Arbitrum Sepolia...");

  const OrbitLaunchRegistry = await hre.ethers.getContractFactory("OrbitLaunchRegistry");
  console.log("Deploying contract...");

  const registry = await OrbitLaunchRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log(`\n✅ OrbitLaunchRegistry deployed to: ${address}`);
  console.log(`\nAdd this to your .env file:`);
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`\nView on Arbiscan:`);
  console.log(`https://sepolia.arbiscan.io/address/${address}`);
  console.log(`\nVerify with:`);
  console.log(`npx hardhat verify --network arbitrumSepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
