import { FC } from 'react';
import { Link } from 'react-router-dom';

import styles from './NotFound.module.scss';

const NotFound: FC = () => {
  return (
    <div className={styles.notFound}>
      <div className={styles.wrapper}>
        <h2>Not found</h2>
        <div>
          <Link to="/">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
