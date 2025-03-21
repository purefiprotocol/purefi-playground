import { FC } from 'react';
import { Layout } from 'antd';
import styles from './Layout.module.scss';

const Footer: FC = () => {
  return (
    <Layout.Footer className={styles.footer}>
      PureFi © {new Date().getFullYear()}
    </Layout.Footer>
  );
};

export default Footer;
