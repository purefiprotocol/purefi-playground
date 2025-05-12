import { FC, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { KycWidget } from '@purefi/kyc-sdk';
import { ToastContainer } from 'react-toastify';
import { Layout as AntdLayout } from 'antd';
import { useSigner } from '@/hooks';
import Header from './Header';
import Content from './Content';
import Footer from './Footer';
import styles from './Layout.module.scss';

const Layout: FC = () => {
  const signer = useSigner();

  useEffect(() => {
    if (signer) {
      KycWidget.setSigner(signer);
    } else {
      KycWidget.unsetSigner();
    }
  }, [signer]);

  return (
    <>
      <AntdLayout className={styles.layout}>
        <Header />
        <Content>
          <Outlet />
          <Footer />
        </Content>
      </AntdLayout>

      <ToastContainer position="top-center" pauseOnHover />
    </>
  );
};

export default Layout;
