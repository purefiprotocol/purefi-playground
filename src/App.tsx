import React, { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { sepolia } from 'viem/chains';

import {
  wagmiAdapter,
  PROJECT_ID,
  wagmiMetadata,
  CHAINS,
  DEFAULT_CHAIN,
} from '@/config';

import { Layout } from '@/components';
import { Home, NotFound } from '@/pages';
import sepoliaSrc from './assets/sepolia.png';

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  networks: CHAINS,
  defaultNetwork: DEFAULT_CHAIN,
  projectId: PROJECT_ID,
  metadata: wagmiMetadata,
  allowUnsupportedChain: false,
  chainImages: {
    [sepolia.id]: sepoliaSrc,
  },
  allWallets: 'SHOW',
  features: {
    swaps: false,
    onramp: false,
    email: false,
    socials: false,
    emailShowWallets: false,
    analytics: true,
  },
});

const App: FC = () => {
  return (
    <React.StrictMode>
      <ConfigProvider>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </WagmiProvider>
      </ConfigProvider>
    </React.StrictMode>
  );
};

export default App;
