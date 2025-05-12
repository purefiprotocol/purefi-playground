import { useRef, useEffect } from 'react';
import { KycWidget } from '@purefi/kyc-sdk';
import { Space } from 'antd';
import { WidgetSettings } from '@/components';

import styles from './Kyc.module.scss';

const Kyc = () => {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    KycWidget.mount(widgetRef.current);
    return () => {
      KycWidget.unmount();
    };
  }, []);

  return (
    <Space direction="vertical" size="middle" className={styles.kyc}>
      <WidgetSettings />

      <div className={styles.kyc__widget} ref={widgetRef} />
    </Space>
  );
};

export default Kyc;
