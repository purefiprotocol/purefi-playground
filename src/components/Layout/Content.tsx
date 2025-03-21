import { FC, ReactNode } from 'react';
import { Layout } from 'antd';
import styles from './Layout.module.scss';

interface ContentProps {
  children: ReactNode;
}

const Content: FC<ContentProps> = (props) => {
  const { children } = props;

  return <Layout.Content className={styles.content}>{children}</Layout.Content>;
};

export default Content;
