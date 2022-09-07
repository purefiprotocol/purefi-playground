import binanceLogo from '../assets/icons/bsc2.svg';
import binanceContainedLogo from '../assets/icons/bsc.svg';
import ethereumLogo from '../assets/icons/eth2.svg';
import ethereumContainedLogo from '../assets/icons/eth.svg';

const AMOUNT_OF_BLOCKS_PER_YEAR_BSC = 10500000;
const AMOUNT_OF_BLOCKS_PER_YEAR_ETHEREUM = 2254114;

export const BSC_MAINNET_NETWORK = {
  name: 'BNB Smart Chain',
  networkId: 56,
  avatar: binanceLogo,
  avatarContained: binanceContainedLogo,
  amountOfBlocksPerYear: AMOUNT_OF_BLOCKS_PER_YEAR_BSC,
  symbol: 'BNB',
  explorerUrl: 'https://bscscan.com',
  explorerName: 'BscScan',
};

export const ETHEREUM_MAINNET_NETWORK = {
  name: 'Ethereum',
  networkId: 1,
  avatar: ethereumLogo,
  avatarContained: ethereumContainedLogo,
  amountOfBlocksPerYear: AMOUNT_OF_BLOCKS_PER_YEAR_ETHEREUM,
  symbol: 'ETH',
  explorerUrl: 'https://etherscan.io',
  explorerName: 'EtherScan',
};

const NETWORKS = {
  [BSC_MAINNET_NETWORK.networkId]: BSC_MAINNET_NETWORK,
  [ETHEREUM_MAINNET_NETWORK.networkId]: ETHEREUM_MAINNET_NETWORK,
};

export { NETWORKS };

export const DEFAULT_NETWORK = BSC_MAINNET_NETWORK;
