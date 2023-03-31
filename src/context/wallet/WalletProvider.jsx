import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import WalletContext from './WalletContext';

const WalletProvider = (props) => {
  const { children } = props;
  const { chain } = useNetwork();
  const { address: account, isConnected, isConnecting } = useAccount();
  const { data: signer } = useSigner();

  const provider = useProvider();

  return (
    <WalletContext.Provider
      value={{
        account,
        chain,
        provider,
        signer,
        connected: isConnected,
        connecting: isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
