import { polygonMumbai } from 'wagmi/chains';

const CONFIGURED_GAS_LIMIT_MULTIPLIERS = {
  [polygonMumbai.id]: 5,
};

const DEFAULT_GAS_LIMIT_MULTIPLIER = 1;

export { CONFIGURED_GAS_LIMIT_MULTIPLIERS, DEFAULT_GAS_LIMIT_MULTIPLIER };
