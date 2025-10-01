import { Chain } from 'wagmi/chains';
import { CHAIN_IDS } from '@/config';

export const checkIfChainSupported = (chainId?: number) => {
  if (!chainId) {
    return false;
  }

  return CHAIN_IDS.includes(chainId);
};

export const getTransactionLink = (hash: string, chain?: Chain) => {
  const explorerUrl = chain?.blockExplorers?.default.url;

  if (!explorerUrl) {
    return hash;
  }

  return `${explorerUrl}/tx/${hash}`;
};

export const sleep = async (ms = 100) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^-\w]+/g, '')
    .replace(/--+/g, '-');
};

export const uniqueArray = (array: number[]) => [...new Set(array)];
