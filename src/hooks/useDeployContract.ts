import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { uploadToIPFS, ipfsHashToBytes32, type DeploymentMetadata } from '@/lib/ipfs';

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '') as `0x${string}`;

const ABI = [
  {
    inputs: [
      { name: '_metadataHash', type: 'bytes32' },
      { name: '_chainId', type: 'uint64' }
    ],
    name: 'registerDeployment',
    outputs: [{ name: 'deploymentId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserDeploymentIds',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_deploymentId', type: 'bytes32' }],
    name: 'getDeployment',
    outputs: [
      {
        components: [
          { name: 'metadataHash', type: 'bytes32' },
          { name: 'chainId', type: 'uint64' },
          { name: 'timestamp', type: 'uint64' },
          { name: 'deployer', type: 'address' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'deploymentId', type: 'bytes32' },
      { indexed: true, name: 'deployer', type: 'address' },
      { indexed: false, name: 'metadataHash', type: 'bytes32' },
      { indexed: false, name: 'chainId', type: 'uint64' },
      { indexed: false, name: 'timestamp', type: 'uint64' }
    ],
    name: 'DeploymentRegistered',
    type: 'event'
  }
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
      } as any);
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
