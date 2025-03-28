import { AppKitNetwork, sepolia } from '@reown/appkit/networks';
import { sepolia as sepoliaViem } from 'viem/chains';

export const DEFAULT_CHAIN = sepolia;
export const DEFAULT_CHAIN_VIEM = sepoliaViem;

export const CHAINS: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia];

export const CHAIN_IDS: (number | string)[] = CHAINS.map((chain) => chain.id);
