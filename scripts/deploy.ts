import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contractAddress: string;
  deployer: string;
  deployerBalance: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: string;
  gasUsed: string;
  gasPrice: string;
  deploymentCost: string;
}

async function main() {
  console.log("🚀 Starting OrbitLaunch Deployment\n");
  console.log("=".repeat(50));

  // Get network info
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const isMainnet = Number(network.chainId) === 42161;

  console.log("\n📋 Deployment Configuration:");
  console.log("=".repeat(50));
  console.log(`Network: ${isMainnet ? "Arbitrum One (MAINNET)" : "Arbitrum Sepolia (Testnet)"}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Deployer: ${deployer.address}`);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log(`Deployer Balance: ${balanceInEth} ETH`);

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no funds!");
  }

  // Estimate gas for deployment
  console.log("\n⛽ Estimating deployment cost...");
  const OrbitLaunchRegistry = await hre.ethers.getContractFactory("OrbitLaunchRegistry");
  const deploymentData = OrbitLaunchRegistry.getDeployTransaction();
  const estimatedGas = await hre.ethers.provider.estimateGas({
    from: deployer.address,
    data: deploymentData.data,
  });
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;
  const estimatedCost = estimatedGas * gasPrice;

  console.log(`Estimated Gas: ${estimatedGas.toString()}`);
  console.log(`Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
  console.log(`Estimated Cost: ${hre.ethers.formatEther(estimatedCost)} ETH`);

  if (balance < estimatedCost) {
    throw new Error(`❌ Insufficient funds! Need ${hre.ethers.formatEther(estimatedCost)} ETH`);
  }

  // Confirm deployment on mainnet
  if (isMainnet) {
    console.log("\n⚠️  WARNING: You are deploying to MAINNET!");
    console.log("This will cost real money. Proceeding in 5 seconds...");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Deploy contract
  console.log("\n📦 Deploying OrbitLaunchRegistry...");
  const registry = await OrbitLaunchRegistry.deploy();
  console.log(`Transaction submitted: ${registry.deploymentTransaction()?.hash}`);

  console.log("⏳ Waiting for confirmations...");
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const deployTx = registry.deploymentTransaction();
  const receipt = await deployTx?.wait();

  // Calculate actual cost
  const gasUsed = receipt?.gasUsed || 0n;
  const actualCost = gasUsed * gasPrice;

  console.log("\n✅ Deployment Successful!");
  console.log("=".repeat(50));
  console.log(`Contract Address: ${address}`);
  console.log(`Block Number: ${receipt?.blockNumber}`);
  console.log(`Gas Used: ${gasUsed.toString()}`);
  console.log(`Deployment Cost: ${hre.ethers.formatEther(actualCost)} ETH`);
  console.log(`Transaction Hash: ${deployTx?.hash}`);

  // Explorer URL
  const explorerUrl = isMainnet
    ? `https://arbiscan.io/address/${address}`
    : `https://sepolia.arbiscan.io/address/${address}`;

  console.log("\n🔍 View on Explorer:");
  console.log(explorerUrl);

  // Save deployment info
  const deploymentInfo: DeploymentInfo = {
    network: isMainnet ? "arbitrum-one" : "arbitrum-sepolia",
    chainId: Number(network.chainId),
    contractAddress: address,
    deployer: deployer.address,
    deployerBalance: balanceInEth,
    blockNumber: receipt?.blockNumber || 0,
    transactionHash: deployTx?.hash || "",
    timestamp: new Date().toISOString(),
    gasUsed: gasUsed.toString(),
    gasPrice: hre.ethers.formatUnits(gasPrice, "gwei"),
    deploymentCost: hre.ethers.formatEther(actualCost),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const deploymentFile = path.join(deploymentsDir, `${deploymentInfo.network}-${timestamp}.json`);
  const latestFile = path.join(deploymentsDir, `${deploymentInfo.network}-latest.json`);

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved:");
  console.log(`- ${deploymentFile}`);
  console.log(`- ${latestFile}`);

  // Instructions
  console.log("\n📝 Next Steps:");
  console.log("=".repeat(50));
  console.log(`1. Update your .env file:`);
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`\n2. Verify contract on Arbiscan:`);
  console.log(`   npx hardhat verify --network ${isMainnet ? "arbitrum" : "arbitrumSepolia"} ${address}`);
  console.log(`\n3. Test contract functions on the block explorer`);
  console.log(`\n4. Update your frontend to use the new address`);

  console.log("\n✨ Deployment Complete!");
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });
