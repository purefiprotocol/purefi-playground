import { sepolia } from 'wagmi/chains';

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

const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'amoy',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    public: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polygonscan',
      url: 'https://amoy.polygonscan.com',
    },
  },
};

const CONFIGURED_CHAINS = [sepolia, polygonAmoy, artheraTestnet];
const DEAFULT_CHAIN = sepolia;

export {
  CONFIGURED_CHAINS,
  DEAFULT_CHAIN,
  sepolia,
  polygonAmoy,
  artheraTestnet,
};
