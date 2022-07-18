/* eslint-disable jsx-a11y/anchor-is-valid */

import { useWallet } from '../../hooks';
import { BSC_MAINNET_NETWORK, NETWORKS } from '../../config';
import { WalletType } from '../../constants';
import metamaskLogo from '../../assets/icons/metamask.svg';
import './Navbar.css';

const Navbar = () => {
  const {
    account,
    connecting,
    activeNetwork,
    networkId,
    connect,
    disconnect,
    onNetworkChange,
  } = useWallet();

  const connectHandler = async () => {
    try {
      if (networkId !== BSC_MAINNET_NETWORK.networkId) {
        await onNetworkChange(BSC_MAINNET_NETWORK);
        connect(WalletType.metamask);
      } else {
        connect(WalletType.metamask);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectHandler = () => {
    try {
      disconnect();
    } catch (error) {
      console.log(error);
    }
  };

  const changeNetworkHandler = async (e) => {
    const networkId = e.target.value;
    await onNetworkChange(NETWORKS[networkId]);
  };

  return (
    <nav className="navbar navbar-dark bg-dark navbar-custom">
      <a href="/" className="navbar-brand" onClick={(e) => e.preventDefault()}>
        SDK Subscription Demo
      </a>

      <form className="form-inline">
        <select
          className="custom-select mr-4"
          onChange={changeNetworkHandler}
          value={activeNetwork.networkId}
        >
          {Object.values(NETWORKS).map((network) => (
            <option key={network.networkId} value={network.networkId}>
              {network.name}
            </option>
          ))}
        </select>
        {!connecting && (
          <>
            {!account && (
              <button
                type="button"
                className="btn btn-light d-flex align-items-center"
                onClick={connectHandler}
              >
                <img
                  height="22px"
                  width="22px"
                  className="mr-2"
                  src={metamaskLogo}
                  alt="metamask"
                />
                Connect
              </button>
            )}

            {account && (
              <>
                <div className="mr-4 text-white account">{`${account.slice(
                  0,
                  6
                )}...${account.slice(-4)}`}</div>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={disconnectHandler}
                >
                  Disconnect
                </button>
              </>
            )}
          </>
        )}
      </form>
    </nav>
  );
};

export default Navbar;
