import { polygonMumbai, zkSyncTestnet } from 'wagmi/chains';

const artheraTestnet = {
  id: 10243,
  name: 'Arthera Testnet',
  network: 'arthera',
  nativeCurrency: {
    name: 'AA',
    symbol: 'AA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-test.arthera.net'],
    },
    public: {
      http: ['https://rpc-test.arthera.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer-test.arthera.net',
    },
  },
};

const CONFIGURED_CHAINS = [
  polygonMumbai,
  artheraTestnet,
  // zkSyncTestnet
];
const DEAFULT_CHAIN = polygonMumbai;

export { CONFIGURED_CHAINS, DEAFULT_CHAIN, artheraTestnet };
