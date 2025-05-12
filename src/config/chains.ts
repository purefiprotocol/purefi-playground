import {
  AppKitNetwork,
  mainnet,
  bsc,
  arbitrum,
  optimism,
  base,
  polygon,
} from '@reown/appkit/networks';
import { mainnet as mainnetViem } from 'viem/chains';

export const DEFAULT_CHAIN = mainnet;
export const DEFAULT_CHAIN_VIEM = mainnetViem;

export const CHAINS: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  bsc,
  arbitrum,
  optimism,
  base,
  polygon,
];

export const CHAIN_IDS: (number | string)[] = CHAINS.map((chain) => chain.id);
