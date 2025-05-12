import { ColorPicker, ColorPickerProps, Flex, GetProp } from 'antd';
import { FC, useEffect, useState } from 'react';
import styles from './SettingsItem.module.scss';

interface SettingsItemColorProps {
  label: string;
  varName: string;
}

type Color = Extract<
  GetProp<ColorPickerProps, 'value'>,
  string | { cleared: any }
>;

const SettingsItemColor: FC<SettingsItemColorProps> = (props) => {
  const { label, varName } = props;

  const [buttonFontColor, setButtonFontColor] = useState<Color>(
    getComputedStyle(document.querySelector(':root')!).getPropertyValue(varName)
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      varName,
      typeof buttonFontColor === 'string'
        ? buttonFontColor
        : buttonFontColor?.toHexString()
    );
  }, [buttonFontColor]);

  return (
    <Flex className={styles.item} gap="middle" vertical>
      <div>{label}</div>
      <ColorPicker value={buttonFontColor} onChange={setButtonFontColor} />
    </Flex>
  );
};

export default SettingsItemColor;
