/**
 * MetaMask network management utilities
 */

export interface NetworkConfig {
  chainId: string | number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/**
 * Add a custom network to MetaMask
 */
export async function addNetworkToMetaMask(config: NetworkConfig): Promise<{ success: boolean; error?: string }> {
  if (typeof window.ethereum === 'undefined') {
    return {
      success: false,
      error: 'MetaMask is not installed',
    };
  }

  try {
    // Convert chainId to hex format
    const chainIdHex = typeof config.chainId === 'number'
      ? `0x${config.chainId.toString(16)}`
      : config.chainId;

    // Request to add the network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: chainIdHex,
          chainName: config.chainName,
          nativeCurrency: config.nativeCurrency,
          rpcUrls: config.rpcUrls,
          blockExplorerUrls: config.blockExplorerUrls,
        },
      ],
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding network to MetaMask:', error);
    
    // User rejected the request
    if (error.code === 4001) {
      return {
        success: false,
        error: 'User rejected the request',
      };
    }

    // Network already added
    if (error.code === -32002) {
      return {
        success: false,
        error: 'Request already pending. Please check MetaMask.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to add network to MetaMask',
    };
  }
}

/**
 * Switch to a specific network in MetaMask
 */
export async function switchToNetwork(chainId: string | number): Promise<{ success: boolean; error?: string }> {
  if (typeof window.ethereum === 'undefined') {
    return {
      success: false,
      error: 'MetaMask is not installed',
    };
  }

  try {
    const chainIdHex = typeof chainId === 'number'
      ? `0x${chainId.toString(16)}`
      : chainId;

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error switching network:', error);

    // Network not added yet
    if (error.code === 4902) {
      return {
        success: false,
        error: 'Network not added to MetaMask yet',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to switch network',
    };
  }
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

/**
 * Get the currently selected network in MetaMask
 */
export async function getCurrentChainId(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId as string;
  } catch (error) {
    console.error('Error getting current chain ID:', error);
    return null;
  }
}
