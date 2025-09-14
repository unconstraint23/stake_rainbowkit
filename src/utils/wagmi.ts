import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

const sepoliaUrl = process.env.NEXT_PUBLIC_SEPOLIA_URL;
const projectId = process.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID;

if (!projectId) {
  throw new Error('Missing env: NEXT_PUBLIC_RAINBOW_PROJECT_ID');
}

export const defaultChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

export const config = getDefaultConfig({
  appName: 'test_project',
  projectId,
  chains: [
    // mainnet, polygon, optimism, arbitrum, base, 
    sepolia] as const,
  ...(sepoliaUrl ? { transports: { [sepolia.id]: http(sepoliaUrl) } } : {}),
  ssr: true,
});
