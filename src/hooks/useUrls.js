import useWallet from './useWallet';
import { CONFIGURED_URLS, DEFAULT_URLS } from '../config';

const useUrls = () => {
  const { chain } = useWallet();

  if (!chain || chain.unsupported || !CONFIGURED_URLS[chain.id]) {
    return DEFAULT_URLS;
  }

  return CONFIGURED_URLS[chain.id];
};

export default useUrls;
