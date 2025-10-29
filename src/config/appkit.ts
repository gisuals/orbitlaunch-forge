import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrum, arbitrumSepolia } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

// 0. Setup queryClient
export const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set');
}

// 2. Create wagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [arbitrumSepolia, arbitrum],
  projectId,
  ssr: false,
});

// 3. Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [arbitrumSepolia, arbitrum],
  defaultNetwork: arbitrumSepolia,
  projectId,
  metadata: {
    name: 'OrbitLaunch',
    description: 'Deploy your Arbitrum Orbit chain in minutes',
    url: 'https://orbitlaunch.app', // Update with your domain
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    email: false, // Optional - enable email login
    socials: false, // Optional - enable social logins
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(var(--primary))',
    '--w3m-border-radius-master': '8px',
  },
});

export const config = wagmiAdapter.wagmiConfig;
