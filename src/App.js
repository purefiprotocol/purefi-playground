import { Routes, Route, BrowserRouter } from 'react-router-dom';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { WalletProvider } from './context';
import { CONFIGURED_CHAINS } from './config';
import { Layout } from './components';
import { Home, NotFound } from './pages';

const wcProjectId = process.env.REACT_APP_WALLECT_CONNECT_PROJECT_ID;

const { chains, publicClient } = configureChains(CONFIGURED_CHAINS, [
  publicProvider(),
]);

const { connectors } = getDefaultWallets({
  appName: 'SDK demo',
  projectId: wcProjectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const App = () => {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <WalletProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WalletProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
};

export default App;
