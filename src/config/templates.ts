export interface ChainTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gaming' | 'defi' | 'nft' | 'general';
  config: {
    chainName: string;
    symbol: string;
    nativeToken: string;
    description: string;
    baseNetwork: string;
    // Advanced settings
    blockTime?: number; // in seconds
    gasLimit?: number;
    features?: string[];
  };
  tags: string[];
  recommended: boolean;
}

export const CHAIN_TEMPLATES: ChainTemplate[] = [
  {
    id: 'gaming',
    name: 'Gaming Chain',
    description: 'Optimized for high-throughput gaming applications with ultra-low latency and NFT support',
    icon: 'Gamepad2',
    category: 'gaming',
    config: {
      chainName: 'GameFi Orbit',
      symbol: 'GAME',
      nativeToken: 'Gaming Token',
      description: 'High-performance chain for gaming applications with NFT and asset management capabilities',
      baseNetwork: 'Arbitrum Sepolia',
      blockTime: 0.25, // 250ms blocks for fast gaming
      gasLimit: 30000000,
      features: ['NFT Optimization', 'Fast Finality', 'Low Gas Costs', 'Asset Management'],
    },
    tags: ['Gaming', 'NFT', 'High TPS', 'Low Latency'],
    recommended: true,
  },
  {
    id: 'defi',
    name: 'DeFi Chain',
    description: 'Enterprise-grade security for decentralized finance with MEV protection and fast finality',
    icon: 'TrendingUp',
    category: 'defi',
    config: {
      chainName: 'DeFi Orbit',
      symbol: 'DEFI',
      nativeToken: 'Finance Token',
      description: 'Secure chain optimized for DeFi protocols with MEV protection and instant finality',
      baseNetwork: 'Arbitrum Sepolia',
      blockTime: 2, // 2s blocks for security
      gasLimit: 50000000,
      features: ['MEV Protection', 'Fast Finality', 'High Security', 'Oracle Ready'],
    },
    tags: ['DeFi', 'Security', 'MEV Protection', 'Trading'],
    recommended: true,
  },
  {
    id: 'nft',
    name: 'NFT Marketplace Chain',
    description: 'Purpose-built for NFT minting, trading, and marketplace operations with IPFS integration',
    icon: 'Image',
    category: 'nft',
    config: {
      chainName: 'NFT Orbit',
      symbol: 'NFTC',
      nativeToken: 'NFT Chain Token',
      description: 'Specialized chain for NFT marketplaces with low minting costs and royalty support',
      baseNetwork: 'Arbitrum Sepolia',
      blockTime: 1, // 1s blocks balanced
      gasLimit: 40000000,
      features: ['IPFS Integration', 'Low Minting Costs', 'Royalty Support', 'Batch Minting'],
    },
    tags: ['NFT', 'Marketplace', 'IPFS', 'Creator Economy'],
    recommended: true,
  },
  {
    id: 'general',
    name: 'General Purpose Chain',
    description: 'Balanced configuration suitable for diverse applications and use cases',
    icon: 'Settings',
    category: 'general',
    config: {
      chainName: 'General Orbit',
      symbol: 'GEN',
      nativeToken: 'General Token',
      description: 'Versatile chain with balanced performance suitable for various applications',
      baseNetwork: 'Arbitrum Sepolia',
      blockTime: 1, // 1s blocks standard
      gasLimit: 30000000,
      features: ['Flexible', 'Standard Config', 'Balanced Performance', 'Easy Setup'],
    },
    tags: ['General', 'Versatile', 'Standard', 'Easy'],
    recommended: false,
  },
];

export function getTemplateById(id: string): ChainTemplate | undefined {
  return CHAIN_TEMPLATES.find(template => template.id === id);
}

export function getRecommendedTemplates(): ChainTemplate[] {
  return CHAIN_TEMPLATES.filter(template => template.recommended);
}

export function getTemplatesByCategory(category: ChainTemplate['category']): ChainTemplate[] {
  return CHAIN_TEMPLATES.filter(template => template.category === category);
}
