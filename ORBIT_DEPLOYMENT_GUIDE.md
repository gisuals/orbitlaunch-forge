# Arbitrum Orbit L3 Chain Deployment Guide

## Overview

This guide explains how to integrate **real Arbitrum Orbit L3 chain deployment** into OrbitLaunch. Due to the complexity and infrastructure requirements, this requires a backend service.

## Why Backend Service?

Deploying a real Orbit chain cannot be done entirely from the frontend because:

1. **Infrastructure Requirements**: Needs validators, batch posters, sequencers running 24/7
2. **Private Keys**: Validator and batch poster keys must be securely managed
3. **Resource Intensive**: Deployment takes 10-30 minutes and significant compute
4. **Cost**: Requires staking ETH and paying for infrastructure
5. **Version Conflicts**: Orbit SDK uses viem v1.x (we use v2.x)

## Architecture

```
Frontend (Current) → Smart Contract (Register) → Backend Service → Orbit SDK → Real L3 Chain
```

### Current Flow (Registration Only)
1. User fills form with chain config
2. Frontend calls smart contract to register configuration
3. Configuration stored on-chain with placeholder RPC URL
4. User redirected to success page

### Full Deployment Flow (Proposed)
1. **Frontend**: User fills form → Calls smart contract
2. **Smart Contract**: Registers config → Emits `ChainRegistered` event
3. **Backend Service**: Listens for event → Triggers deployment
4. **Orbit Deployment**:
   - Creates rollup contracts
   - Deploys validators
   - Starts sequencer
   - Configures batch poster
5. **Backend Updates**: Calls smart contract with real RPC URL
6. **User Dashboard**: Shows live chain stats

## Implementation Steps

### Step 1: Install Dependencies (Backend)

Create a new backend service:

```bash
mkdir orbitlaunch-backend
cd orbitlaunch-backend
npm init -y
npm install @arbitrum/orbit-sdk viem@^1.20.0 ethers@^6 dotenv express
```

### Step 2: Backend Service Structure

```
orbitlaunch-backend/
├── src/
│   ├── server.ts              # Express API server
│   ├── orbitDeployer.ts       # Orbit SDK integration
│   ├── eventListener.ts       # Listen for ChainRegistered events
│   ├── walletManager.ts       # Generate validator/poster wallets
│   ├── nodeManager.ts         # Manage chain nodes
│   └── config.ts              # Configuration
├── .env
├── package.json
└── tsconfig.json
```

### Step 3: Environment Variables

```env
# Parent Chain (Arbitrum Sepolia)
PARENT_CHAIN_RPC=https://sepolia-rollup.arbitrum.io/rpc
DEPLOYER_PRIVATE_KEY=0x...

# Smart Contract
ORBITLAUNCH_CONTRACT=0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232

# Infrastructure
NODE_PROVIDER=aws|gcp|digital-ocean
VALIDATOR_STAKE_AMOUNT=1000000000000000000  # 1 ETH

# API
PORT=3001
API_SECRET=your-secret-key
```

### Step 4: Orbit Deployer Implementation

```typescript
// src/orbitDeployer.ts
import {
  createRollupPrepareDeploymentParamsConfig,
  createRollup,
} from '@arbitrum/orbit-sdk';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';

export class OrbitDeployer {
  private publicClient;
  private walletClient;

  constructor(privateKey: string, parentChainRpc: string) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    this.publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(parentChainRpc),
    });

    this.walletClient = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(parentChainRpc),
    });
  }

  async deployChain(config: {
    chainName: string;
    chainId: number;
    owner: string;
    batchPoster: string;
    validator: string;
    gasTokenAddress?: string;
  }) {
    console.log(`Deploying Orbit chain: ${config.chainName}`);

    // Step 1: Prepare deployment parameters
    const deploymentParams = createRollupPrepareDeploymentParamsConfig(
      this.publicClient,
      {
        chainId: BigInt(config.chainId),
        owner: config.owner as `0x${string}`,
        chainConfig: {
          chainId: config.chainId,
          homesteadBlock: 0,
          daoForkBlock: null,
          daoForkSupport: true,
          eip150Block: 0,
          eip150Hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          eip155Block: 0,
          eip158Block: 0,
          byzantiumBlock: 0,
          constantinopleBlock: 0,
          petersburgBlock: 0,
          istanbulBlock: 0,
          muirGlacierBlock: 0,
          berlinBlock: 0,
          londonBlock: 0,
          clique: {
            period: 0,
            epoch: 0,
          },
          arbitrum: {
            EnableArbOS: true,
            AllowDebugPrecompiles: false,
            DataAvailabilityCommittee: false,
            InitialArbOSVersion: 11,
            InitialChainOwner: config.owner,
            GenesisBlockNum: 0,
          },
        },
      }
    );

    // Step 2: Deploy rollup contracts
    const result = await createRollup({
      params: deploymentParams,
      account: this.walletClient.account!,
      publicClient: this.publicClient,
      walletClient: this.walletClient as any,
    });

    console.log('Rollup deployed:', result);

    return {
      rollupAddress: result.rollup,
      inboxAddress: result.inbox,
      outboxAddress: result.outbox,
      adminProxyAddress: result.adminProxy,
      sequencerInboxAddress: result.sequencerInbox,
      bridgeAddress: result.bridge,
      txHash: result.transactionHash,
    };
  }
}
```

### Step 5: Event Listener

```typescript
// src/eventListener.ts
import { createPublicClient, http, parseAbiItem } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { OrbitDeployer } from './orbitDeployer';

const CONTRACT_ABI = parseAbiItem(
  'event ChainRegistered(uint256 indexed chainId, address indexed deployer, string chainName, string ipfsHash)'
);

export class EventListener {
  private publicClient;
  private deployer: OrbitDeployer;

  constructor(rpcUrl: string, contractAddress: string, deployer: OrbitDeployer) {
    this.publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpcUrl),
    });
    this.deployer = deployer;
  }

  async startListening(contractAddress: string) {
    console.log('Listening for ChainRegistered events...');

    const unwatch = this.publicClient.watchContractEvent({
      address: contractAddress as `0x${string}`,
      abi: [CONTRACT_ABI],
      eventName: 'ChainRegistered',
      onLogs: async (logs) => {
        for (const log of logs) {
          await this.handleChainRegistration(log);
        }
      },
    });

    return unwatch;
  }

  async handleChainRegistration(log: any) {
    const { chainId, deployer, chainName, ipfsHash } = log.args;

    console.log(`New chain registration detected:`, {
      chainId,
      deployer,
      chainName,
      ipfsHash,
    });

    // Fetch metadata from IPFS
    const metadata = await this.fetchIPFSMetadata(ipfsHash);

    // Deploy the actual Orbit chain
    const deployment = await this.deployer.deployChain({
      chainName: metadata.chainName,
      chainId: Number(chainId),
      owner: deployer,
      batchPoster: process.env.BATCH_POSTER_ADDRESS!,
      validator: process.env.VALIDATOR_ADDRESS!,
      gasTokenAddress: metadata.gasTokenAddress,
    });

    // Update smart contract with real RPC URL
    await this.updateChainRpcUrl(chainId, deployment);
  }

  async fetchIPFSMetadata(ipfsHash: string) {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    return response.json();
  }

  async updateChainRpcUrl(chainId: bigint, deployment: any) {
    // Call smart contract to update RPC URL
    const rpcUrl = `https://rpc-${chainId}.orbitlaunch.io`;
    console.log(`Updating chain ${chainId} with RPC: ${rpcUrl}`);

    // TODO: Implement smart contract call to updateRpcUrl(chainId, rpcUrl)
  }
}
```

### Step 6: Update Smart Contract

Add this function to `OrbitLaunchRegistry.sol`:

```solidity
// Only backend service can update RPC URLs
mapping(address => bool) public authorizedUpdaters;

function updateChainRpcUrl(uint256 chainId, string memory rpcUrl) external {
    require(authorizedUpdaters[msg.sender], "Not authorized");
    require(deployments[chainId].deployer != address(0), "Chain not registered");

    deployments[chainId].rpcUrl = rpcUrl;
    emit ChainRpcUpdated(chainId, rpcUrl);
}

function addAuthorizedUpdater(address updater) external onlyOwner {
    authorizedUpdaters[updater] = true;
}
```

### Step 7: Node Infrastructure

You'll need to run:

1. **Sequencer Node**: Orders transactions and creates blocks
2. **Validator Node**: Validates state transitions and submits fraud proofs
3. **Batch Poster**: Posts transaction batches to parent chain
4. **RPC Node**: Serves RPC requests

**Option A: Self-Hosted**
- Requires multiple VPS/cloud instances
- ~$500-2000/month for production
- Complex DevOps management

**Option B: Managed Service**
- Use [Caldera](https://caldera.xyz/) or [Conduit](https://conduit.xyz/)
- $1000-5000/month
- Handles infrastructure for you

**Option C: Development Only**
- Use Arbitrum's test node locally
- Free but not production-ready

### Step 8: Cost Estimates

**One-time Deployment Costs:**
- Gas for rollup deployment: ~0.1-0.5 ETH
- Validator stake: 1 ETH minimum
- Total: ~1.5 ETH (~$3,000) per chain

**Ongoing Costs (Monthly):**
- Sequencer node: $500-1000
- Validator node: $200-500
- Batch poster gas: $100-500
- RPC nodes: $200-500
- Total: ~$1,000-2,500/month per chain

## Simpler Alternative: Partner with Existing Services

Instead of building everything from scratch, integrate with existing Orbit deployment platforms:

### Option 1: Caldera Integration

```typescript
// Frontend calls Caldera API
const response = await fetch('https://api.caldera.xyz/v1/chains', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CALDERA_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: formData.chainName,
    symbol: formData.symbol,
    chainId: chainId,
    gasToken: gasTokenAddress,
    template: selectedTemplate,
  }),
});

const { rpcUrl, explorerUrl } = await response.json();
```

### Option 2: Conduit Integration

Similar API-based approach with Conduit's deployment service.

## Recommended Approach for OrbitLaunch

Given the complexity and cost, I recommend a **hybrid approach**:

### Phase 1: Current (Registration Only)  ✅
- Users register chain configurations
- Store metadata on-chain
- Display placeholder URLs
- **Cost**: Only gas for registration (~$1-5)

### Phase 2: Manual Deployment (Next)
- Provide detailed deployment guide
- Users deploy via Orbit SDK themselves
- Users update RPC URL in dashboard
- **Cost**: Users pay their own infrastructure

### Phase 3: Automated Backend (Future)
- Build backend deployment service
- Integrate Orbit SDK
- Charge users for deployment + infrastructure
- **Cost**: $3000 setup + $1000/month per chain (passed to users)

### Phase 4: Managed Service Partner (Best)
- Integrate with Caldera/Conduit
- Seamless one-click deployment
- They handle all infrastructure
- **Cost**: Revenue share with partner

## Next Steps

1. ✅ Current implementation (registration) is correct
2. ✅ Add "Update RPC URL" feature to Dashboard
3. ⏳ Create detailed user guide for manual deployment
4. ⏳ Build backend service for automated deployment
5. ⏳ Partner with Caldera or Conduit for managed service

## Conclusion

Real Orbit L3 deployment requires significant infrastructure and cost. Your current approach of registering chains on-chain is a great first step. To enable real deployments, you'll need to either:

- Build a backend service with node infrastructure
- Partner with existing Orbit deployment platforms
- Guide users to deploy manually and update URLs

The simplest path forward is to add an "Update RPC URL" feature to the Dashboard, allowing users who deploy chains manually to connect them to OrbitLaunch.
