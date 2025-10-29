import { useState, useEffect } from 'react';
import { fetchChainStats, fetchRecentBlocks, calculateAverageBlockTime, type ChainStats } from '@/lib/rpc';

export function useChainStats(rpcUrl: string, refreshInterval: number = 10000) {
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rpcUrl) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const chainStats = await fetchChainStats(rpcUrl);

        if (!chainStats.isResponding) {
          setError('Chain is not responding. It may not be deployed yet or the RPC URL is incorrect.');
        }

        setStats(chainStats);
      } catch (err) {
        setError('Failed to fetch chain statistics');
        console.error('Error fetching chain stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up polling
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [rpcUrl, refreshInterval]);

  return { stats, isLoading, error };
}

export function useRecentBlocks(rpcUrl: string, count: number = 5, refreshInterval: number = 15000) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [averageBlockTime, setAverageBlockTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rpcUrl) return;

    const fetchBlocks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const recentBlocks = await fetchRecentBlocks(rpcUrl, count);

        if (recentBlocks.length > 0) {
          setBlocks(recentBlocks);
          const avgTime = calculateAverageBlockTime(recentBlocks);
          setAverageBlockTime(avgTime);
        } else {
          setError('No blocks found');
        }
      } catch (err) {
        setError('Failed to fetch recent blocks');
        console.error('Error fetching blocks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchBlocks();

    // Set up polling
    const interval = setInterval(fetchBlocks, refreshInterval);

    return () => clearInterval(interval);
  }, [rpcUrl, count, refreshInterval]);

  return { blocks, averageBlockTime, isLoading, error };
}
