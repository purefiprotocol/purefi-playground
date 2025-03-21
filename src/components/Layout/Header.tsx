import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { Flex, Layout } from 'antd';

import { ConnectButton } from '../ConnectButton';

import logoSrc from '@/assets/purefi.svg';

import styles from './Layout.module.scss';

const Navbar: FC = () => {
  return (
    <>
      <Layout.Header className={styles.header}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap="small">
            <Flex align="center" className={styles.nav__logo}>
              <img className={styles.logo} src={logoSrc} alt="logo" />
            </Flex>

            <div className={styles.nav__item}>
              <NavLink className={styles.nav__link} to="/">
                Playground
              </NavLink>
            </div>
          </Flex>
          <ConnectButton />
        </Flex>
      </Layout.Header>
    </>
  );
};

export default Navbar;
