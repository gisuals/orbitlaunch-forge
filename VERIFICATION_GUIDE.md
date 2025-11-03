# Contract Verification Guide

## Deployed Contract Information

- **Network**: Arbitrum One (Mainnet)
- **Contract Address**: `0x3a2D0ac1CD3389A6a9E842d81806A5457e0a1fA0`
- **Contract Name**: OrbitLaunchRegistry
- **Deployer**: 0x208B2660e5F62CDca21869b389c5aF9E7f0faE89
- **Deployment Transaction**: [0xd35bcb06bcb8e41e21749263f762b67b969d923eeae9c3d8bc657633a785a4e4](https://arbiscan.io/tx/0xd35bcb06bcb8e41e21749263f762b67b969d923eeae9c3d8bc657633a785a4e4)
- **Block Number**: 396349501
- **Deployment Cost**: 0.00000332169 ETH
- **Gas Used**: 332,169

## Manual Verification on Arbiscan

Visit: https://arbiscan.io/verifyContract?a=0x3a2D0ac1CD3389A6a9E842d81806A5457e0a1fA0

### Compiler Settings

1. **Compiler Type**: Solidity (Single file)
2. **Compiler Version**: v0.8.20+commit.a1b79de6
3. **Open Source License Type**: MIT License (3)

### Optimization Settings

4. **Optimization**: Yes
5. **Runs**: 200
6. **Via IR**: Yes

### Contract Source

Copy the content from: `contracts/OrbitLaunchRegistry.sol`

### Constructor Arguments

Leave empty (no constructor arguments)

## View on Arbiscan

- **Contract**: https://arbiscan.io/address/0x3a2D0ac1CD3389A6a9E842d81806A5457e0a1fA0
- **Transaction**: https://arbiscan.io/tx/0xd35bcb06bcb8e41e21749263f762b67b969d923eeae9c3d8bc657633a785a4e4

## Deployment Details

The contract was deployed on November 3, 2025 using the standalone deployment script with the following features:

- ✅ Pre-deployment balance check
- ✅ Gas estimation before deployment
- ✅ Mainnet warning with 5-second delay
- ✅ Automatic deployment info saving to JSON
- ✅ Post-deployment instructions

## Frontend Integration

The contract address has been updated in:
- `.env` file: `VITE_CONTRACT_ADDRESS=0x3a2D0ac1CD3389A6a9E842d81806A5457e0a1fA0`
- `README.md`: Updated with mainnet deployment information
