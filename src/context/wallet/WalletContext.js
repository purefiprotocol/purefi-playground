import { createContext } from 'react';

const initialContext = {
  account: '',
  connected: false,
  connecting: false,
};

const WalletContext = createContext(initialContext);

export default WalletContext;
