import { readContract } from '@wagmi/core';
import { isAddress } from 'viem';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isValid: boolean;
}

const ERC20_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Validates if an address is a valid ERC-20 token
 * @param tokenAddress - The ERC-20 token contract address
 * @param config - Wagmi config
 * @returns TokenInfo object with token details
 */
export async function validateERC20Token(
  tokenAddress: string,
  config: any
): Promise<TokenInfo> {
  // Check if address is valid
  if (!isAddress(tokenAddress)) {
    return {
      address: tokenAddress,
      name: '',
      symbol: '',
      decimals: 0,
      isValid: false,
    };
  }

  try {
    // Try to read token name, symbol, and decimals
    const [name, symbol, decimals] = await Promise.all([
      readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);

    return {
      address: tokenAddress,
      name: name as string,
      symbol: symbol as string,
      decimals: Number(decimals),
      isValid: true,
    };
  } catch (error) {
    console.error('Error validating ERC-20 token:', error);
    return {
      address: tokenAddress,
      name: '',
      symbol: '',
      decimals: 0,
      isValid: false,
    };
  }
}

/**
 * Check if an address is the zero address (native ETH)
 */
export function isNativeToken(address: string): boolean {
  return address === '0x0000000000000000000000000000000000000000' || address === '';
}

/**
 * Format token display name
 */
export function formatTokenDisplay(tokenInfo: TokenInfo): string {
  if (isNativeToken(tokenInfo.address)) {
    return 'ETH (Native)';
  }
  return `${tokenInfo.symbol} (${tokenInfo.name})`;
}

/**
 * Common testnet tokens for quick selection
 */
export const COMMON_TESTNET_TOKENS = [
  {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    network: 'Arbitrum Sepolia',
  },
  // Add more common testnet tokens here as needed
];
