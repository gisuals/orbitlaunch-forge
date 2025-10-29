/**
 * RPC utilities for querying chain statistics
 */

export interface ChainStats {
  blockNumber: number;
  gasPrice: string;
  chainId: number;
  isResponding: boolean;
  lastBlockTime?: number;
  averageBlockTime?: number;
}

/**
 * Fetch basic chain statistics from RPC endpoint
 */
export async function fetchChainStats(rpcUrl: string): Promise<ChainStats> {
  try {
    // Fetch block number
    const blockNumberResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    if (!blockNumberResponse.ok) {
      throw new Error('Failed to fetch block number');
    }

    const blockNumberData = await blockNumberResponse.json();
    const blockNumber = parseInt(blockNumberData.result, 16);

    // Fetch chain ID
    const chainIdResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 2,
      }),
    });

    const chainIdData = await chainIdResponse.json();
    const chainId = parseInt(chainIdData.result, 16);

    // Fetch gas price
    const gasPriceResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 3,
      }),
    });

    const gasPriceData = await gasPriceResponse.json();
    const gasPrice = parseInt(gasPriceData.result, 16);

    return {
      blockNumber,
      gasPrice: (gasPrice / 1e9).toFixed(2) + ' Gwei',
      chainId,
      isResponding: true,
    };
  } catch (error) {
    console.error('Error fetching chain stats:', error);
    return {
      blockNumber: 0,
      gasPrice: 'N/A',
      chainId: 0,
      isResponding: false,
    };
  }
}

/**
 * Fetch recent block information
 */
export async function fetchRecentBlocks(rpcUrl: string, count: number = 5): Promise<any[]> {
  try {
    // First get the latest block number
    const blockNumberResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    const blockNumberData = await blockNumberResponse.json();
    const latestBlock = parseInt(blockNumberData.result, 16);

    // Fetch recent blocks
    const blocks = [];
    for (let i = 0; i < count; i++) {
      const blockNum = latestBlock - i;
      const blockResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: ['0x' + blockNum.toString(16), true],
          id: i + 10,
        }),
      });

      const blockData = await blockResponse.json();
      if (blockData.result) {
        blocks.push({
          number: parseInt(blockData.result.number, 16),
          timestamp: parseInt(blockData.result.timestamp, 16),
          transactions: blockData.result.transactions.length,
          hash: blockData.result.hash,
        });
      }
    }

    return blocks;
  } catch (error) {
    console.error('Error fetching recent blocks:', error);
    return [];
  }
}

/**
 * Calculate average block time from recent blocks
 */
export function calculateAverageBlockTime(blocks: any[]): number {
  if (blocks.length < 2) return 0;

  const timeDiffs = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const diff = blocks[i].timestamp - blocks[i + 1].timestamp;
    timeDiffs.push(diff);
  }

  const average = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal
}
