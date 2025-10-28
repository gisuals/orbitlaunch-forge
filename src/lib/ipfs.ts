/**
 * IPFS utilities using Pinata (free tier) or web3.storage
 * No backend needed - upload directly from browser
 */

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export interface DeploymentMetadata {
  chainName: string;
  symbol: string;
  nativeToken: string;
  description: string;
  baseNetwork: string;
  rpcUrl?: string;
  explorerUrl?: string;
  logo?: string;
}

/**
 * Upload metadata to IPFS via Pinata
 */
export async function uploadToIPFS(metadata: DeploymentMetadata): Promise<string> {
  const data = JSON.stringify({
    pinataContent: metadata,
    pinataMetadata: {
      name: `${metadata.chainName}-deployment.json`,
    },
  });

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error("Failed to upload to IPFS");
  }

  const result = await response.json();
  return result.IpfsHash; // Returns CID like "Qm..."
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchFromIPFS(ipfsHash: string): Promise<DeploymentMetadata> {
  const response = await fetch(`${PINATA_GATEWAY}${ipfsHash}`);

  if (!response.ok) {
    throw new Error("Failed to fetch from IPFS");
  }

  return response.json();
}

/**
 * Convert IPFS CID to bytes32 for gas efficiency
 * Using CIDv0 (Qm...) base58 -> bytes32
 */
export async function ipfsHashToBytes32(ipfsHash: string): Promise<string> {
  // Import bs58 dynamically for browser compatibility
  const bs58Module = await import('bs58');
  const bs58 = bs58Module.default;
  const bytes = bs58.decode(ipfsHash);

  // Remove first 2 bytes (0x12 0x20 - multihash identifier)
  const hash = bytes.slice(2);

  // Convert to hex string
  return '0x' + Array.from(hash).map((b: number) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert bytes32 back to IPFS CID
 */
export async function bytes32ToIpfsHash(bytes32: string): Promise<string> {
  // Import bs58 dynamically for browser compatibility
  const bs58Module = await import('bs58');
  const bs58 = bs58Module.default;

  // Remove 0x prefix
  const hex = bytes32.replace('0x', '');

  // Convert hex to bytes
  const hashBytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  // Add multihash prefix (0x1220 for sha256)
  const prefixedBytes = new Uint8Array([0x12, 0x20, ...hashBytes]);

  return bs58.encode(prefixedBytes);
}
