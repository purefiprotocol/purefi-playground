import { FC, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Drawer, Flex, Layout } from 'antd';

import { ExportOutlined, MenuOutlined } from '@ant-design/icons';

import { ConnectButton } from '../ConnectButton';

import logoSrc from '@/assets/purefi.svg';

import styles from './Layout.module.scss';
import { useMediaQuery } from 'react-responsive';

const Navbar: FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isMobile = useMediaQuery({
    query: '(max-width: 992px)',
  });

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <Layout.Header className={styles.header}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap="small">
            <Flex align="center" className={styles.nav__logo}>
              <img className={styles.logo} src={logoSrc} alt="logo" />
            </Flex>

            {isMobile && (
              <div className={styles.drawer__button_wrapper}>
                <Button className={styles.drawer__button} onClick={openDrawer}>
                  <MenuOutlined />
                </Button>
              </div>
            )}

            {!isMobile && (
              <>
                <div className={styles.nav__item}>
                  <NavLink className={styles.nav__link} to="/">
                    Playground
                  </NavLink>
                </div>
                <div className={styles.nav__item}>
                  <a
                    className={styles.nav__link}
                    href="https://docs.purefi.io/"
                    rel="noopener norefferer"
                    target="_blank"
                  >
                    <Flex gap={8} align="center">
                      <span>Docs</span>
                      <ExportOutlined />
                    </Flex>
                  </a>
                </div>
              </>
            )}
          </Flex>
          <ConnectButton />
        </Flex>
      </Layout.Header>

      <Drawer
        title="Menu"
        placement="bottom"
        key="bottom"
        className={styles.drawer}
        onClose={closeDrawer}
        open={isDrawerOpen}
        closable
      >
        <Flex vertical>
          <div className={styles.nav__item}>
            <NavLink className={styles.nav__link} to="/" onClick={closeDrawer}>
              Playground
            </NavLink>
          </div>
          <div className={styles.nav__item}>
            <a
              className={styles.nav__link}
              href="https://docs.purefi.io/"
              rel="noopener norefferer"
              target="_blank"
            >
              <Flex gap={8} align="center">
                <span>Docs</span>
                <ExportOutlined />
              </Flex>
            </a>
          </div>
        </Flex>
      </Drawer>
    </>
  );
};

export default Navbar;
