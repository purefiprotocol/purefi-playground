import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Layout as AntdLayout } from 'antd';
import Header from './Header';
import Content from './Content';
import Footer from './Footer';
import styles from './Layout.module.scss';

const Layout: FC = () => {
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
