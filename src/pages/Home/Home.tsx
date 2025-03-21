import { FC } from 'react';
import { Playground } from '@/components';

import styles from './Home.module.scss';

const Home: FC = () => {
  return (
    <div className={styles.home}>
      <Playground />
    </div>
  );
};

export default Home;
