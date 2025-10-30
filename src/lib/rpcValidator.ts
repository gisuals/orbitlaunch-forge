/**
 * Validates if a URL is a valid RPC endpoint
 */
export async function validateRpcUrl(url: string): Promise<{
  isValid: boolean;
  error?: string;
  chainId?: number;
  blockNumber?: number;
}> {
  // Basic URL validation
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use http or https protocol' };
    }
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Test RPC connection
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) {
      return { isValid: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();

    if (data.error) {
      return { isValid: false, error: data.error.message || 'RPC error' };
    }

    const chainId = parseInt(data.result, 16);

    // Also test eth_blockNumber to ensure it's responsive
    const blockResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 2,
      }),
    });

    const blockData = await blockResponse.json();
    const blockNumber = blockData.result ? parseInt(blockData.result, 16) : undefined;

    return {
      isValid: true,
      chainId,
      blockNumber,
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Failed to connect to RPC endpoint',
    };
  }
}

/**
 * Checks if a URL is a placeholder (not a real RPC)
 */
export function isPlaceholderRpcUrl(url: string): boolean {
  if (!url) return true;

  // Check for common placeholder patterns
  const placeholderPatterns = [
    /^https?:\/\/rpc\..+\.arbitrum\.io$/,
    /^https?:\/\/example\./,
    /^https?:\/\/placeholder\./,
    /^https?:\/\/localhost/,
    /^https?:\/\/127\.0\.0\.1/,
  ];

  return placeholderPatterns.some(pattern => pattern.test(url));
}
