import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  console.log("🚀 Starting OrbitLaunch Deployment\n");
  console.log("=".repeat(50));

  // Setup provider and wallet
  const rpcUrl = process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY not found in .env file!");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("\n📋 Deployment Configuration:");
  console.log("=".repeat(50));
  console.log(`Network: Arbitrum One (MAINNET)`);
  console.log(`Chain ID: 42161`);
  console.log(`Deployer: ${wallet.address}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log(`Deployer Balance: ${balanceInEth} ETH`);

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no funds!");
  }

  // Load contract ABI and bytecode
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "OrbitLaunchRegistry.sol", "OrbitLaunchRegistry.json");

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`❌ Contract artifact not found at ${artifactPath}. Run 'npm run compile' first.`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  // Estimate gas
  console.log("\n⛽ Estimating deployment cost...");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const deployTx = await factory.getDeployTransaction();
  const estimatedGas = await provider.estimateGas({
    from: wallet.address,
    data: deployTx.data,
  });
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;
  const estimatedCost = estimatedGas * gasPrice;

  console.log(`Estimated Gas: ${estimatedGas.toString()}`);
  console.log(`Gas Price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
  console.log(`Estimated Cost: ${ethers.formatEther(estimatedCost)} ETH`);

  if (balance < estimatedCost) {
    throw new Error(`❌ Insufficient funds! Need ${ethers.formatEther(estimatedCost)} ETH`);
  }

  // Confirm deployment
  console.log("\n⚠️  WARNING: You are deploying to MAINNET!");
  console.log("This will cost real money. Proceeding in 5 seconds...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Deploy
  console.log("\n📦 Deploying OrbitLaunchRegistry...");
  const contract = await factory.deploy();
  console.log(`Transaction submitted: ${contract.deploymentTransaction().hash}`);

  console.log("⏳ Waiting for confirmations...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const receipt = await contract.deploymentTransaction().wait();

  // Calculate actual cost
  const gasUsed = receipt.gasUsed;
  const actualCost = gasUsed * gasPrice;

  console.log("\n✅ Deployment Successful!");
  console.log("=".repeat(50));
  console.log(`Contract Address: ${address}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
  console.log(`Gas Used: ${gasUsed.toString()}`);
  console.log(`Deployment Cost: ${ethers.formatEther(actualCost)} ETH`);
  console.log(`Transaction Hash: ${receipt.hash}`);

  const explorerUrl = `https://arbiscan.io/address/${address}`;
  console.log("\n🔍 View on Explorer:");
  console.log(explorerUrl);

  // Save deployment info
  const deploymentInfo = {
    network: "arbitrum-one",
    chainId: 42161,
    contractAddress: address,
    deployer: wallet.address,
    deployerBalance: balanceInEth,
    blockNumber: receipt.blockNumber,
    transactionHash: receipt.hash,
    timestamp: new Date().toISOString(),
    gasUsed: gasUsed.toString(),
    gasPrice: ethers.formatUnits(gasPrice, "gwei"),
    deploymentCost: ethers.formatEther(actualCost),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const deploymentFile = path.join(deploymentsDir, `arbitrum-one-${timestamp}.json`);
  const latestFile = path.join(deploymentsDir, `arbitrum-one-latest.json`);

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
  console.log(`   npx hardhat verify --network arbitrum ${address}`);
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
