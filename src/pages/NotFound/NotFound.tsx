import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Result } from 'antd';

import styles from './NotFound.module.scss';

const NotFound: FC = () => {
  return (
    <div className={styles.notFound}>
      <div className={styles.wrapper}>
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={<Link to="/">Home</Link>}
        />
      </div>
    </div>
  );
};

export default NotFound;
