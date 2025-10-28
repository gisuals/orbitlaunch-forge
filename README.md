# 🚀 OrbitLaunch - Decentralized Deployment Platform

> **Vercel for Arbitrum** - Deploy and register your blockchain projects on-chain with gas-optimized smart contracts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Arbitrum](https://img.shields.io/badge/Arbitrum-Sepolia-orange)](https://arbitrum.io/)
[![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](./test)

## 📖 Overview

OrbitLaunch is a decentralized platform for developers to register and track their blockchain deployments on Arbitrum. Built with gas optimization and user experience in mind, it combines IPFS metadata storage with on-chain registry for complete transparency and immutability.

**Live on Arbitrum Sepolia**: [`0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232`](https://sepolia.arbiscan.io/address/0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232)

## ✨ Features

- 🔐 **Wallet Integration** - Connect with MetaMask, WalletConnect, Coinbase Wallet via Reown AppKit
- ⛓️ **On-Chain Registry** - Immutable deployment records on Arbitrum
- 📦 **IPFS Metadata** - Decentralized metadata storage via Pinata
- ⚡ **Gas Optimized** - ~80-100k gas per deployment with packed storage and via-IR compilation
- 🎨 **Modern UI** - Beautiful, responsive interface built with shadcn/ui
- 🧪 **100% Test Coverage** - Comprehensive smart contract testing
- 🌙 **Dark Mode** - Theme toggle for user preference

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**:
  - Reown AppKit v1.8.12 (WalletConnect)
  - Wagmi v2.13.6
  - Viem v2.21.54
- **Storage**: IPFS via Pinata

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Network**: Arbitrum (Sepolia testnet)
- **Testing**: 100% coverage (33 tests)

### Key Dependencies
```json
{
  "@reown/appkit": "^1.8.12",
  "@reown/appkit-adapter-wagmi": "^1.8.12",
  "wagmi": "^2.13.6",
  "viem": "^2.21.54",
  "bs58": "^6.0.0",
  "hardhat": "^2.22.18"
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Arbitrum Sepolia ETH ([get from faucet](https://faucet.quicknode.com/arbitrum/sepolia))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd orbitlaunch-forge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values:
# - VITE_WALLETCONNECT_PROJECT_ID=1eebe528ca0ce94a99ceaa2e915058d7
# - VITE_PINATA_JWT=your_pinata_jwt
# - VITE_CONTRACT_ADDRESS=0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232
```

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

# Run tests
npm run test

# Test coverage
npm run test:coverage

# Deploy to Arbitrum Sepolia
npm run deploy:testnet

# Deploy to Arbitrum mainnet
npm run deploy:mainnet
```

### Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

## 📝 Smart Contract

### OrbitLaunchRegistry.sol

Gas-optimized registry for deployment tracking:

```solidity
struct Deployment {
    bytes32 metadataHash;  // IPFS hash (32 bytes)
    uint64 chainId;        // Chain ID (packed)
    uint64 timestamp;      // Deployment time (packed)
    address deployer;      // Deployer address
}

function registerDeployment(bytes32 _metadataHash, uint64 _chainId)
    external returns (bytes32 deploymentId);

function getDeployment(bytes32 _deploymentId)
    external view returns (Deployment memory);

function getUserDeploymentIds(address _user)
    external view returns (bytes32[] memory);
```

**Key Features**:
- ✅ Packed storage variables (uint64 instead of uint256)
- ✅ IPFS hash as bytes32 (not string)
- ✅ Event emissions for indexing
- ✅ Via-IR compilation for optimization
- ✅ No constructor arguments (easy deployment)

**Gas Benchmarks**:
- Register deployment: ~80-160k gas
- Update deployment: ~30-50k gas
- View functions: Free (read-only)

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend (required)
VITE_WALLETCONNECT_PROJECT_ID=1eebe528ca0ce94a99ceaa2e915058d7
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_CONTRACT_ADDRESS=0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232

# Smart Contract Deployment (required for deployment only)
PRIVATE_KEY=0x_your_private_key_here
ARBISCAN_API_KEY=your_arbiscan_api_key
```

**Get Your Keys**:
- WalletConnect Project ID: [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Pinata JWT: [Pinata Dashboard](https://app.pinata.cloud/)
- Arbiscan API Key: [Arbiscan](https://arbiscan.io/myapikey)

## 🧪 Testing

The smart contract has **100% test coverage** with 33 comprehensive tests:

```bash
npm run test
```

**Test Results**:
- ✅ 33 passing tests
- ✅ 100% statement coverage
- ✅ 100% branch coverage
- ✅ 100% function coverage
- ✅ 100% line coverage

See [CONTRACT_TESTING_COMPLETE.md](CONTRACT_TESTING_COMPLETE.md) for details.

## 📖 Usage

### 1. Connect Wallet
- Click the wallet button in the header
- Select your wallet (MetaMask, WalletConnect, etc.)
- Approve the connection

### 2. Deploy a Chain
- Navigate to the Deploy page
- Fill in your deployment details:
  - Chain Name
  - Symbol
  - Native Token
  - Description
  - Base Network
  - RPC URL
- Click "Deploy Chain"
- Approve the transaction in your wallet

### 3. Verify Deployment
- View transaction on success page
- Check details on [Arbiscan](https://sepolia.arbiscan.io/)
- Access metadata on IPFS via Pinata gateway

## 🏗️ Project Structure

```
orbitlaunch-forge/
├── contracts/              # Smart contracts
│   └── OrbitLaunchRegistry.sol
├── scripts/                # Deployment scripts
│   └── deploy.ts
├── test/                   # Contract tests
│   └── OrbitLaunchRegistry.test.ts
├── src/
│   ├── components/         # React components
│   ├── config/             # App configuration
│   │   └── appkit.ts       # Wallet connection config
│   ├── hooks/              # Custom React hooks
│   │   └── useDeployContract.ts
│   ├── lib/                # Utilities
│   │   └── ipfs.ts         # IPFS helpers
│   └── pages/              # Application pages
│       ├── Index.tsx       # Landing page
│       ├── Deploy.tsx      # Deployment form
│       └── Success.tsx     # Success page
├── hardhat.config.ts       # Hardhat configuration
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## 🌐 Deployment

### Testnet (Arbitrum Sepolia)
Already deployed: `0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232`

### Mainnet (Arbitrum One)
```bash
# Deploy contract
npm run deploy:mainnet

# Update .env with new contract address
# Build and deploy frontend
npm run build
# Deploy dist/ to Vercel, Netlify, or IPFS
```

## 🔗 Links

- **Contract (Sepolia)**: https://sepolia.arbiscan.io/address/0x4D7d440a869E5Aadd2b4589bAeaEbff3391a3232
- **Arbitrum Faucet**: https://faucet.quicknode.com/arbitrum/sepolia
- **Pinata**: https://pinata.cloud/
- **WalletConnect**: https://cloud.walletconnect.com/
- **Arbitrum Docs**: https://docs.arbitrum.io/

## 📚 Documentation

- [FRONTEND_INTEGRATION_COMPLETE.md](FRONTEND_INTEGRATION_COMPLETE.md) - Integration details
- [CONTRACT_TESTING_COMPLETE.md](CONTRACT_TESTING_COMPLETE.md) - Test coverage
- [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md) - Deployment guide
- [READY_TO_TEST.md](READY_TO_TEST.md) - Testing walkthrough

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev/)
- Powered by [Arbitrum](https://arbitrum.io/)
- Wallet connection by [Reown AppKit](https://docs.reown.com/appkit)
- Storage by [Pinata](https://pinata.cloud/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test files for examples

---

**Built with ❤️ for the Arbitrum ecosystem**
