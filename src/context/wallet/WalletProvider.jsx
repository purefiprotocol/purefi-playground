import { useAccount, useNetwork } from 'wagmi';
import WalletContext from './WalletContext';
import { useEthersSigner, useEthersProvider } from '../../hooks';

const WalletProvider = (props) => {
  const { children } = props;
  const { chain } = useNetwork();
  const { address: account, isConnected, isConnecting } = useAccount();
  const signer = useEthersSigner();
  const provider = useEthersProvider();

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
