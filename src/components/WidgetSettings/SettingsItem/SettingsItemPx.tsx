import { Flex, InputNumberProps, Slider } from 'antd';
import { FC, useEffect, useState } from 'react';
import styles from './SettingsItem.module.scss';

interface SettingsItemPxProps {
  label: string;
  varName: string;
}

const SettingsItemPx: FC<SettingsItemPxProps> = (props) => {
  const { label, varName } = props;

  const [value, setValue] = useState<number>(
    parseInt(
      getComputedStyle(document.querySelector(':root')!).getPropertyValue(
        varName
      )
    )
  );

  useEffect(() => {
    document.documentElement.style.setProperty(varName, value + 'px');
  }, [value]);

  const changeHandler: InputNumberProps['onChange'] = (newValue) => {
    setValue(newValue as number);
  };

  return (
    <Flex className={styles.item} gap="middle" vertical>
      <div>{label}</div>
      <Slider
        min={1}
        max={20}
        onChange={changeHandler}
        value={typeof value === 'number' ? value : 0}
      />
    </Flex>
  );
};

export default SettingsItemPx;
