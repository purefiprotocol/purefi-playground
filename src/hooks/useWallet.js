import { useContext } from 'react';
import { WalletContext } from '../context';

const useWallet = () => {
  const wallet = useContext(WalletContext);
  return wallet;
};

export default useWallet;
