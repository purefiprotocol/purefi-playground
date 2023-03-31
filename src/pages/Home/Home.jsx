import { useWallet } from '../../hooks';
import { Form } from '../../components';
import './Home.css';

function Home() {
  const { connected, connecting, chain } = useWallet();

  const render = () => {
    if (connecting) {
      return <div>Loading...</div>;
    } else if (!connected) {
      return (
        <div className="alert alert-primary mb-2" role="alert">
          Please, connect wallet to proceed
        </div>
      );
    } else if (connected) {
      if (chain.unsupported) {
        return (
          <div className="alert alert-primary mb-2" role="alert">
            Please, switch to a network the dapp supports
          </div>
        );
      } else {
        return <Form />;
      }
    } else {
      return <></>;
    }
  };

  return (
    <div className="container-fluid">
      <div className="home">{render()}</div>
    </div>
  );
}

export default Home;
