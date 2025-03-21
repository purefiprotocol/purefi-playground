import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

import { CHAINS } from './chains';

const PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

const wagmiMetadata = {
  name: 'PureFi | Playground',
  description: 'PureFi | Playground',
  url: 'https://playground.purefi.io',
  icons: [
    'https://user-images.githubusercontent.com/23620645/136548302-6bf7f6e0-8236-44bf-b75a-9c067e9347da.png',
  ],
};

const wagmiAdapter = new WagmiAdapter({
  networks: CHAINS,
  projectId: PROJECT_ID,
});

export { wagmiAdapter, wagmiMetadata, PROJECT_ID };
