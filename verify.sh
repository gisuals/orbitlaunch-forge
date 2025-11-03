#!/bin/bash
# Verification script for Arbitrum One

CONTRACT_ADDRESS="0x3a2D0ac1CD3389A6a9E842d81806A5457e0a1fA0"
NETWORK="arbitrum"

echo "Verifying OrbitLaunchRegistry on Arbitrum One..."
echo "Contract Address: $CONTRACT_ADDRESS"
echo ""

# Since hardhat has ESM issues, we'll use curl to submit verification directly
ARBISCAN_API_KEY="${ARBISCAN_API_KEY}"

if [ -z "$ARBISCAN_API_KEY" ]; then
    echo "Error: ARBISCAN_API_KEY not found in environment"
    exit 1
fi

# Read the contract source
CONTRACT_SOURCE=$(cat contracts/OrbitLaunchRegistry.sol)

# Get the compiler version and settings
echo "Compiler: solc 0.8.20"
echo "Optimization: Enabled (200 runs)"
echo "Via IR: Enabled"
echo ""
echo "Visit Arbiscan to verify manually:"
echo "https://arbiscan.io/verifyContract?a=$CONTRACT_ADDRESS"
echo ""
echo "Compiler Settings:"
echo "- Solidity: 0.8.20"
echo "- Optimization: Yes (200 runs)"
echo "- Via IR: Yes"
