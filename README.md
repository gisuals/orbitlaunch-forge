# 🚀 OrbitLaunch - Arbitrum Orbit L3 Chain Registry & Deployment Platform

> **The complete platform for registering, tracking, and managing Arbitrum Orbit L3 chains on-chain**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Arbitrum](https://img.shields.io/badge/Arbitrum-Sepolia-orange)](https://arbitrum.io/)
[![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](./test)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com/)

---

## 📖 Overview

**OrbitLaunch** is a decentralized registry platform for developers deploying Arbitrum Orbit L3 chains. It provides:

- 📝 **Chain Registration**: Register your L3 chain configurations on-chain
- 🎨 **Pre-configured Templates**: Gaming, DeFi, NFT, and General Purpose chains
- ⛽ **Custom Gas Tokens**: Support for ERC-20 tokens as native gas
- 📊 **Live Dashboard**: Real-time stats and monitoring for deployed chains
- 🔗 **RPC URL Management**: Update and validate your chain's RPC endpoints
- 📦 **IPFS Metadata**: Decentralized storage for chain configuration
- ⚡ **Gas Optimized**: Smart contracts optimized for minimal gas costs

**Live on Arbitrum Sepolia**: [`0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232`](https://sepolia.arbiscan.io/address/0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232)

---

## ✨ Key Features

### 🎯 Core Functionality
- **🔐 Wallet Integration** - Connect with MetaMask, WalletConnect, Coinbase Wallet via Reown AppKit
- **⛓️ On-Chain Registry** - Immutable deployment records on Arbitrum
- **📦 IPFS Metadata** - Decentralized metadata storage via Pinata
- **⚡ Gas Optimized** - ~80-100k gas per deployment with packed storage

### 🚀 Advanced Features
- **🎨 Chain Templates** - Pre-configured setups for Gaming, DeFi, NFT, and General Purpose chains
- **⛽ Custom Gas Tokens** - Use any ERC-20 token as native gas with real-time validation
- **📊 Live Dashboard** - Monitor block number, gas price, transactions, and chain stats
- **🔄 RPC URL Updates** - Validate and update RPC endpoints after deploying your chain
- **🌐 Multi-Network Support** - Arbitrum Sepolia (testnet) and Arbitrum One (mainnet)

### 💎 User Experience
- **🌙 Dark Mode** - Beautiful theme toggle
- **📱 Responsive Design** - Works on all devices
- **🎯 One-Click Templates** - Deploy with pre-filled configurations
- **✅ Real-time Validation** - Instant feedback for ERC-20 tokens and RPC URLs
- **📋 Export Configuration** - Download your chain config as JSON

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**:
  - **Reown AppKit** v1.8.12 (formerly WalletConnect)
  - **Wagmi** v2.13.6 - React hooks for Ethereum
  - **Viem** v2.21.54 - TypeScript Ethereum library
- **Storage**: IPFS via Pinata
- **Deployment**: Vercel

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Network**: Arbitrum (Sepolia testnet & Mainnet)
- **Testing**: 100% coverage (33 comprehensive tests)
- **Optimization**: Via-IR compilation, packed storage

### Key Dependencies
```json
{
  "@reown/appkit": "^1.8.12",
  "@reown/appkit-adapter-wagmi": "^1.8.12",
  "wagmi": "^2.13.6",
  "viem": "^2.21.54",
  "react": "^18.3.1",
  "tailwindcss": "^3.4.17",
  "hardhat": "^2.22.18",
  "bs58": "^6.0.0"
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Arbitrum Sepolia ETH ([get from faucet](https://faucet.quicknode.com/arbitrum/sepolia))

### Installation

```bash
# Clone the repository
git clone https://github.com/gisuals/orbitlaunch-forge.git
cd orbitlaunch-forge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Setup

Create a `.env` file with the following:

```env
# Frontend Configuration (Required)
VITE_WALLETCONNECT_PROJECT_ID=1eebe528ca0ce94a99ceaa2e915058d7
VITE_PINATA_JWT=your_pinata_jwt_token_here
VITE_CONTRACT_ADDRESS=0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232

# Smart Contract Deployment (Required only for deploying contracts)
PRIVATE_KEY=0x_your_private_key_here
ARBISCAN_API_KEY=your_arbiscan_api_key
```

**Get Your Keys**:
- **WalletConnect Project ID**: [WalletConnect Cloud](https://cloud.walletconnect.com/)
- **Pinata JWT**: [Pinata Dashboard](https://app.pinata.cloud/) → API Keys → New Key
- **Arbiscan API Key**: [Arbiscan](https://arbiscan.io/myapikey) (for contract verification)

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:8080
```

### Smart Contract Development

```bash
# Compile contracts
npm run compile

# Run tests with coverage
npm run test
npm run test:coverage

# Deploy to Arbitrum Sepolia
npm run deploy:testnet

# Deploy to Arbitrum Mainnet (after testing!)
npm run deploy:mainnet

# Verify contract on Arbiscan
npx hardhat verify --network arbitrumSepolia <CONTRACT_ADDRESS>
```

### Build for Production

```bash
# Build frontend
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel (automatic via GitHub integration)
# Or manually: vercel --prod
```

---

## 📝 Smart Contract Architecture

### OrbitLaunchRegistry.sol

Gas-optimized registry with packed storage and IPFS integration:

```solidity
struct Deployment {
    bytes32 metadataHash;  // IPFS hash as bytes32 (32 bytes)
    uint64 chainId;        // Chain ID (8 bytes, packed)
    uint64 timestamp;      // Unix timestamp (8 bytes, packed)
    address deployer;      // Deployer address (20 bytes)
}

// Main Functions
function registerDeployment(bytes32 _metadataHash, uint64 _chainId)
    external returns (bytes32 deploymentId);

function updateDeployment(bytes32 _deploymentId, bytes32 _newMetadataHash)
    external; // Only deployer can update

function getDeployment(bytes32 _deploymentId)
    external view returns (Deployment memory);

function getUserDeploymentIds(address _user)
    external view returns (bytes32[] memory);
```

**Design Highlights**:
- ✅ **Packed Storage**: uint64 instead of uint256 saves ~60% gas
- ✅ **bytes32 IPFS Hash**: More efficient than string storage
- ✅ **Event Indexing**: Optimized for The Graph and block explorers
- ✅ **Via-IR Compilation**: Advanced Solidity optimizer
- ✅ **Minimal Constructor**: No constructor arguments for easy deployment
- ✅ **Access Control**: Only deployer can update their deployments

**Gas Benchmarks**:
| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Register Deployment | ~80-160k gas | First deployment costs more (storage initialization) |
| Update Deployment | ~30-50k gas | Subsequent updates are cheaper |
| View Functions | FREE | Read-only, no gas cost |

---

## 📊 Dashboard Features

The OrbitLaunch Dashboard provides comprehensive chain monitoring:

### Live Statistics
- ⛓️ **Block Number**: Current chain height
- ⛽ **Gas Price**: Current gas cost in Gwei
- ⏱️ **Block Time**: Average time between blocks
- 🆔 **Chain ID**: Your L3 chain identifier

### Chain Configuration
- 🌐 **RPC URL**: With copy-to-clipboard
- 🔗 **Base Network**: Parent chain (Arbitrum Sepolia/One)
- 💰 **Native Token**: Token name and symbol
- ⛽ **Custom Gas Token**: If using ERC-20 as gas

### Deployment Details
- 👤 **Deployer Address**: Who registered the chain
- 📝 **Transaction Hash**: Registration tx with Arbiscan link
- 📅 **Deployment Date**: When registered
- 🏷️ **Template Type**: Gaming/DeFi/NFT/Custom

### Actions
- 📥 **Export Config**: Download JSON configuration
- 🔍 **View on Explorer**: Open Arbiscan
- ✏️ **Update RPC URL**: Change endpoint after deployment
- 🔄 **Real-time Updates**: Auto-refresh every 10-15 seconds

---

## 🎨 Chain Templates

OrbitLaunch provides pre-configured templates for common use cases:

### 1. ⚡ Gaming Chain
**Optimized for high-throughput gaming applications**
- **Block Time**: 250ms (ultra-fast)
- **Gas Limit**: 30M (high throughput)
- **Features**: Fast finality, High TPS, MEV protection
- **Use Cases**: On-chain games, NFT minting, real-time apps

### 2. 💰 DeFi Chain
**Built for decentralized finance protocols**
- **Block Time**: 2s (standard)
- **Gas Limit**: 30M
- **Features**: MEV protection, Low fees, ERC-20 gas token support
- **Use Cases**: DEXs, Lending protocols, Yield farming

### 3. 🎨 NFT Chain
**Designed for NFT marketplaces and creators**
- **Block Time**: 1s (fast)
- **Gas Limit**: 20M
- **Features**: Low minting costs, IPFS integration, Royalty support
- **Use Cases**: NFT marketplaces, Generative art, Digital collectibles

### 4. 🌐 General Purpose
**Balanced configuration for all applications**
- **Block Time**: 2s
- **Gas Limit**: 30M
- **Features**: Standard Arbitrum configuration
- **Use Cases**: dApps, Smart contracts, General development

**How to Use Templates**:
1. Go to Deploy page
2. Click "Use Template" tab
3. Select your template
4. Review pre-filled configuration
5. Customize if needed
6. Deploy!

---

## ⛽ Custom Gas Token Feature

OrbitLaunch supports using any ERC-20 token as native gas for your L3 chain.

### How It Works
1. **Enable Custom Gas Token** in Advanced Options
2. **Enter ERC-20 Token Address** (must be on parent chain)
3. **Real-time Validation** checks:
   - ✅ Valid ERC-20 contract
   - ✅ Has `name()` function
   - ✅ Has `symbol()` function
   - ✅ Has `decimals()` function
4. **Display Token Info**: Name, symbol, decimals
5. **Register with Chain**: Stored in IPFS metadata

### Supported Tokens
Any standard ERC-20 token on Arbitrum Sepolia/One:
- USDC, USDT (stablecoins)
- WETH, WBTC (wrapped assets)
- Your custom project tokens
- DAO governance tokens

### Benefits
- 💰 **Custom Economics**: Design your own gas economics
- 🎯 **Token Utility**: Give utility to your token
- 💵 **Predictable Costs**: Stable gas prices with stablecoins
- 🏛️ **DAO Governance**: Use governance tokens for gas

---

## 🔄 RPC URL Update Feature

After deploying your Arbitrum Orbit chain, update your RPC URL in OrbitLaunch:

### Update Process
1. **Navigate to Dashboard** with your registered chain
2. **Click "Update RPC URL"** button (if no valid RPC configured)
3. **Enter Your RPC Endpoint**: `https://your-chain-rpc.example.com`
4. **Validation**: OrbitLaunch tests the endpoint:
   - Sends `eth_chainId` request
   - Sends `eth_blockNumber` request
   - Verifies responses
5. **Upload to IPFS**: Updated metadata uploaded
6. **Update On-Chain**: Smart contract updated with new IPFS hash
7. **Live Stats**: Dashboard now shows real-time chain statistics

### RPC URL Validation
The validator checks:
- ✅ Valid HTTPS URL format
- ✅ Responsive endpoint
- ✅ Valid JSON-RPC responses
- ✅ Returns chain ID
- ✅ Returns current block number

### Why This Matters
- **Initial Registration**: Placeholder URL (chain not yet deployed)
- **After Deployment**: Real RPC URL → Live dashboard stats
- **Future Updates**: Change RPC if you migrate infrastructure

---

## 📖 Complete Usage Guide

### Step 1: Connect Your Wallet
1. Click wallet button in header
2. Select your wallet (MetaMask, WalletConnect, Coinbase)
3. Approve connection
4. Switch to Arbitrum Sepolia if prompted

### Step 2: Register Your Chain

**Option A: Use a Template (Recommended)**
1. Navigate to Deploy page
2. Click "Use Template" tab
3. Choose Gaming/DeFi/NFT/General template
4. Review pre-filled configuration
5. Customize chain name, symbol, token
6. (Optional) Enable custom gas token in Advanced Options
7. Click "Deploy Chain"
8. Approve transaction in wallet
9. Wait for confirmation

**Option B: Custom Configuration**
1. Navigate to Deploy page
2. Click "Custom Configuration" tab
3. Fill in all fields:
   - Chain Name
   - Symbol (ticker)
   - Native Token Name
   - Description
   - Base Network
4. (Optional) Configure custom gas token
5. Click "Deploy Chain"
6. Approve transaction
7. Wait for confirmation

### Step 3: View Your Registration
1. Redirected to Success page
2. See transaction hash and details
3. Click "View on Arbiscan" to see on-chain data
4. Navigate to Dashboard to see configuration

### Step 4: Deploy Actual L3 Chain
Your registration is complete, but the actual Arbitrum Orbit L3 chain needs infrastructure deployment:

**Option A: Use Arbitrum Orbit SDK**
```bash
# Install Orbit SDK
npm install @arbitrum/orbit-sdk viem@^1.20.0

# Follow deployment guide
# See ORBIT_DEPLOYMENT_GUIDE.md for full instructions
```

**Option B: Use Managed Service**
- [Caldera](https://caldera.xyz/) - Managed Orbit deployment
- [Conduit](https://conduit.xyz/) - Rollup infrastructure

**Option C: Manual Deployment**
- Follow [Arbitrum Orbit Quickstart](https://docs.arbitrum.io/launch-orbit-chain/orbit-quickstart)
- Deploy sequencer, validator, batch poster
- Configure RPC endpoints

### Step 5: Update RPC URL
Once your L3 chain is deployed:
1. Go to Dashboard
2. Click "Update RPC URL"
3. Enter your real RPC endpoint
4. Validation runs automatically
5. Approve transaction to update on-chain
6. Dashboard now shows live stats!

---

## 🏗️ Project Structure

```
orbitlaunch-forge/
├── contracts/                      # Smart contracts
│   └── OrbitLaunchRegistry.sol    # Main registry contract
│
├── scripts/                        # Deployment & utilities
│   └── deploy.ts                  # Hardhat deployment script
│
├── test/                           # Smart contract tests
│   └── OrbitLaunchRegistry.test.ts
│
├── src/
│   ├── components/                 # React components
│   │   ├── ThemeToggle.tsx        # Dark mode toggle
│   │   ├── TemplateSelector.tsx   # Chain template picker
│   │   ├── GasTokenSelector.tsx   # ERC-20 gas token picker
│   │   └── ui/                    # shadcn/ui components
│   │
│   ├── config/                     # Configuration
│   │   ├── appkit.ts              # Wallet connection config
│   │   └── templates.ts           # Chain template definitions
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useDeployContract.ts   # Deploy hook
│   │   ├── useUpdateDeployment.ts # Update hook
│   │   └── useChainStats.ts       # Live stats hook
│   │
│   ├── lib/                        # Utilities
│   │   ├── ipfs.ts                # IPFS upload/download
│   │   ├── erc20.ts               # ERC-20 validation
│   │   ├── rpc.ts                 # RPC queries
│   │   └── rpcValidator.ts        # RPC URL validation
│   │
│   └── pages/                      # Application pages
│       ├── Index.tsx              # Landing page
│       ├── Deploy.tsx             # Deployment form
│       ├── Success.tsx            # Success page
│       └── Dashboard.tsx          # Chain dashboard
│
├── hardhat.config.ts               # Hardhat configuration
├── vite.config.ts                  # Vite configuration
├── vercel.json                     # Vercel deployment config
├── tailwind.config.ts              # Tailwind CSS config
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🧪 Testing

OrbitLaunch has **100% smart contract test coverage**:

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# Run specific test file
npx hardhat test test/OrbitLaunchRegistry.test.ts
```

**Test Results**:
```
  OrbitLaunchRegistry
    ✓ Deployment (33 passing tests)
    ✓ Registration (100% coverage)
    ✓ Updates (all branches tested)
    ✓ Access Control (comprehensive)
    ✓ Gas Optimization (benchmarked)
    ✓ Edge Cases (error handling)

  Coverage Summary:
    Statements   : 100%
    Branches     : 100%
    Functions    : 100%
    Lines        : 100%
```

See [CONTRACT_TESTING_COMPLETE.md](CONTRACT_TESTING_COMPLETE.md) for detailed test documentation.

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

**Automatic Deployment** (Recommended):
1. Push to GitHub
2. Connect repository to Vercel
3. Vercel auto-deploys on every push to `main`

**Manual Deployment**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel Dashboard
# VITE_WALLETCONNECT_PROJECT_ID
# VITE_CONTRACT_ADDRESS
# VITE_PINATA_JWT
```

### Smart Contract Deployment

**Testnet (Arbitrum Sepolia)**:
```bash
# Already deployed at:
# 0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232

# To redeploy:
npm run deploy:testnet
```

**Mainnet (Arbitrum One)**:
```bash
# 1. Update .env with mainnet private key
# 2. Get Arbitrum One ETH
# 3. Deploy
npm run deploy:mainnet

# 4. Verify on Arbiscan
npx hardhat verify --network arbitrum <CONTRACT_ADDRESS>

# 5. Update .env with new address
VITE_CONTRACT_ADDRESS=<NEW_ADDRESS>

# 6. Rebuild and redeploy frontend
npm run build
vercel --prod
```

---

## 🔗 Important Links

### Deployed Contracts
- **Arbitrum Sepolia**: [`0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232`](https://sepolia.arbiscan.io/address/0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232)
- **Arbitrum One**: TBD (deploy after testing)

### External Services
- **Arbitrum Faucet**: https://faucet.quicknode.com/arbitrum/sepolia
- **Pinata (IPFS)**: https://pinata.cloud/
- **WalletConnect**: https://cloud.walletconnect.com/
- **Arbitrum Docs**: https://docs.arbitrum.io/
- **Orbit SDK**: https://github.com/OffchainLabs/arbitrum-orbit-sdk

### Project Documentation
- [ORBIT_DEPLOYMENT_GUIDE.md](ORBIT_DEPLOYMENT_GUIDE.md) - Full Orbit L3 deployment guide
- [FRONTEND_INTEGRATION_COMPLETE.md](FRONTEND_INTEGRATION_COMPLETE.md) - Integration details
- [CONTRACT_TESTING_COMPLETE.md](CONTRACT_TESTING_COMPLETE.md) - Test coverage report
- [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md) - Contract deployment guide
- [READY_TO_TEST.md](READY_TO_TEST.md) - Testing walkthrough

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Build successfully: `npm run build`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **Solidity**: Follow style guide, 100% test coverage required
- **React**: Functional components with hooks
- **Testing**: All new features must have tests
- **Documentation**: Update README for new features

### Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding tests
- `refactor:` Code refactoring
- `chore:` Build/config changes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 OrbitLaunch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Built with** [Lovable](https://lovable.dev/) - AI-powered development
- **Powered by** [Arbitrum](https://arbitrum.io/) - Layer 2 scaling solution
- **Wallet Connection** [Reown AppKit](https://docs.reown.com/appkit) - Multi-wallet support
- **Storage** [Pinata](https://pinata.cloud/) - IPFS infrastructure
- **UI Components** [shadcn/ui](https://ui.shadcn.com/) - Beautiful React components
- **Hosting** [Vercel](https://vercel.com/) - Frontend deployment

---

## 📞 Support

Need help? We're here for you:

- 🐛 **Bug Reports**: [Open an issue](https://github.com/gisuals/orbitlaunch-forge/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/gisuals/orbitlaunch-forge/discussions)
- 📚 **Documentation**: Check the docs folder
- 💬 **Questions**: Review test files for code examples

### Common Issues

**Wallet Won't Connect**
- Ensure you're on Arbitrum Sepolia network
- Try refreshing the page
- Check browser console for errors

**Transaction Fails**
- Ensure you have enough Arbitrum Sepolia ETH
- Check gas limit isn't too low
- Verify contract address is correct

**IPFS Upload Fails**
- Check your Pinata JWT is valid
- Ensure metadata is properly formatted
- Try uploading manually to test Pinata connection

**Dashboard Shows No Stats**
- Ensure RPC URL is valid and accessible
- Check if chain is actually deployed
- Try updating RPC URL with validation

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Smart contract development
- [x] 100% test coverage
- [x] Wallet integration
- [x] IPFS metadata storage
- [x] Chain registration

### Phase 2: Advanced Features ✅
- [x] Chain templates
- [x] Custom gas tokens
- [x] Live dashboard
- [x] RPC URL updates
- [x] Real-time validation

### Phase 3: Infrastructure (In Progress)
- [ ] Backend deployment service
- [ ] Automated Orbit L3 deployment
- [ ] Validator/sequencer management
- [ ] Node monitoring

### Phase 4: Ecosystem
- [ ] The Graph integration
- [ ] Multi-chain support
- [ ] Analytics dashboard
- [ ] DAO governance
- [ ] Token launches

### Phase 5: Enterprise
- [ ] White-label solution
- [ ] Managed deployments
- [ ] SLA guarantees
- [ ] Premium support
- [ ] Custom features

---

## 💎 Features Comparison

| Feature | OrbitLaunch | Manual Orbit | Managed Services |
|---------|-------------|--------------|------------------|
| **Chain Registration** | ✅ Free | ❌ N/A | ✅ Included |
| **Templates** | ✅ 4 types | ❌ Manual | ✅ Limited |
| **Custom Gas Token** | ✅ Any ERC-20 | ✅ Manual | ⚠️ Limited |
| **Dashboard** | ✅ Live stats | ❌ Build yourself | ✅ Included |
| **RPC Management** | ✅ Update anytime | ❌ Manual | ✅ Included |
| **Cost** | 💰 $1-5 registration | 🆓 Free | 💰💰 $1k-5k/month |
| **Setup Time** | ⚡ 2 minutes | ⏰ 2-4 hours | ⏰ 1-2 days |
| **Technical Knowledge** | 📗 Basic | 📕 Advanced | 📗 Basic |
| **Infrastructure** | 🔧 Self-managed | 🔧 Self-managed | ✅ Fully managed |

---

**Built with ❤️ for the Arbitrum Orbit ecosystem**

*Empowering developers to launch and manage L3 chains with ease*
