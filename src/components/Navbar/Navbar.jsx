import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useUrls } from '../../hooks';
import openSrc from '../../assets/icons/open.svg';

function Navbar() {
  const urls = useUrls();

  return (
    <nav className="navbar navbar-dark navbar-expand-md bg-dark">
      <div className="d-flex justify-content-between w-100">
        <div>
          <Link className="navbar-brand" to="/">
            SDK Subscription Demo
          </Link>
        </div>

        <div>
          <form className="form-inline">
            <div className="mr-2">
              <Link
                className="btn btn-link"
                target="_blankk"
                to={urls.dashboard}
              >
                <span className="mr-2">Dashboard</span>
                <img height="10px" src={openSrc} alt="open" />
              </Link>
            </div>
            <div>
              <ConnectButton
                accountStatus="address"
                chainStatus={{ smallScreen: 'icon', largeScreen: 'full' }}
                showBalance={false}
              />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
