import { Routes, Route, BrowserRouter } from 'react-router-dom';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { polygonMumbai, zkSyncTestnet } from 'wagmi/chains';
import { WalletProvider } from './context';
import { CONFIGURED_CHAINS } from './config';
import { Layout } from './components';
import { Home, NotFound } from './pages';
import polygonLogo from './assets/icons/polygon.webp';
import zkSyncLogo from './assets/icons/zksync.png';

const wcProjectId = process.env.REACT_APP_WALLECT_CONNECT_PROJECT_ID;

const { chains, provider } = configureChains(CONFIGURED_CHAINS, [
  w3mProvider({ projectId: wcProjectId }),
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId: wcProjectId, version: 1, chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

const App = () => {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
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
      </WagmiConfig>

      <Web3Modal
        projectId={wcProjectId}
        ethereumClient={ethereumClient}
        chainImages={{
          [polygonMumbai.id]: polygonLogo,
          [zkSyncTestnet.id]: zkSyncLogo,
        }}
        enableNetworkView
      />
    </>
  );
};

export default App;
