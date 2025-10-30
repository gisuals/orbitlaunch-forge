import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import { uploadToIPFS } from "@/lib/ipfs";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

const ABI = [
  {
    name: "updateDeployment",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_deploymentId", type: "bytes32" },
      { name: "_newMetadataHash", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

export function useUpdateDeployment() {
  const [isUploading, setIsUploading] = useState(false);
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updateDeployment = async (deploymentId: string, updatedMetadata: any) => {
    try {
      setIsUploading(true);

      // Upload updated metadata to IPFS
      const ipfsHash = await uploadToIPFS(updatedMetadata);
      console.log("Updated metadata uploaded to IPFS:", ipfsHash);

      setIsUploading(false);

      // Convert IPFS hash to bytes32
      const metadataHash = `0x${ipfsHash}` as `0x${string}`;

      // Call smart contract
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "updateDeployment",
        args: [deploymentId as `0x${string}`, metadataHash],
      });
    } catch (err) {
      setIsUploading(false);
      throw err;
    }
  };

  return {
    updateDeployment,
    isUploading,
    isLoading: isPending || isConfirming,
    isSuccess,
    error,
    txHash: hash,
  };
}
