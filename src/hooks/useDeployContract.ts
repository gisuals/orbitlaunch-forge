import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { parseAbiItem } from 'viem';
import { uploadToIPFS, ipfsHashToBytes32, type DeploymentMetadata } from '@/lib/ipfs';

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '') as `0x${string}`;

const ABI = [
  parseAbiItem('function registerDeployment(bytes32 _metadataHash, uint64 _chainId) external returns (bytes32)'),
  parseAbiItem('function getUserDeploymentIds(address _user) external view returns (bytes32[])'),
  parseAbiItem('function getDeployment(bytes32 _deploymentId) external view returns (tuple(bytes32 metadataHash, uint64 chainId, uint64 timestamp, address deployer))'),
  parseAbiItem('event DeploymentRegistered(bytes32 indexed deploymentId, address indexed deployer, bytes32 metadataHash, uint64 chainId, uint64 timestamp)'),
] as const;

export function useDeployContract() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  const registerDeployment = async (
    metadata: DeploymentMetadata,
    chainId: number
  ) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured. Please deploy the contract first.');
    }

    try {
      // 1. Upload metadata to IPFS
      const ipfsHash = await uploadToIPFS(metadata);
      console.log('📦 Uploaded to IPFS:', ipfsHash);

      // 2. Convert to bytes32
      const bytes32Hash = await ipfsHashToBytes32(ipfsHash);
      console.log('📝 Converted to bytes32:', bytes32Hash);

      // 3. Call contract
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'registerDeployment',
        args: [bytes32Hash as `0x${string}`, BigInt(chainId)],
      });
    } catch (error) {
      console.error('Failed to register deployment:', error);
      throw error;
    }
  };

  return {
    registerDeployment,
    isSuccess,
    isLoading: isPending || isLoading,
    txHash: hash,
    error,
    isConnected,
    address,
  };
}

export function useUserDeployments(userAddress?: `0x${string}`) {
  const { data: deploymentIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getUserDeploymentIds',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!CONTRACT_ADDRESS,
    },
  });

  return { deploymentIds: deploymentIds as readonly `0x${string}`[] | undefined };
}
