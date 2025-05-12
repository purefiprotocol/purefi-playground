import { FC, useState } from 'react';
import {
  Button,
  Col,
  Collapse,
  CollapseProps,
  Drawer,
  Flex,
  Row,
  Space,
  Typography,
} from 'antd';
import { SettingsItemColor, SettingsItemPx } from './SettingsItem';
import {
  CaretRightOutlined,
  ExportOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styles from './WidgetSettings.module.scss';
import { Link } from 'react-router-dom';

const WidgetSettings: FC = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className={styles.widget_settings}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Row gutter={[16, 8]} align="stretch">
          <Col className="gutter-row" xs={24} lg={12}>
            <Typography.Text style={{ fontSize: 16 }}>
              <span style={{ paddingRight: 5 }}>
                The full list of configurable css variables as well as other
                widget options and parameters can be found in docs of the
                corresponding npm package
              </span>
              <Link
                target="_blank"
                rel="noopener norefferer"
                to="https://www.npmjs.com/package/@purefi/kyc-sdk"
              >
                <span>@purefi/kyc-sdk</span> <ExportOutlined />
              </Link>
            </Typography.Text>
          </Col>
        </Row>

        <Row gutter={[16, 8]} align="stretch">
          <Col className="gutter-row" xs={24} lg={6}>
            <Button
              color="blue"
              variant="solid"
              onClick={showDrawer}
              icon={<SettingOutlined />}
              block
            >
              Widget Appearance Settings
            </Button>
          </Col>
        </Row>
      </Space>

      <Drawer
        title="Widget Appearance Settings"
        closable={{ 'aria-label': 'Close Button' }}
        size="large"
        onClose={onClose}
        open={open}
      >
        <Flex gap="middle" vertical>
          <div>
            <h3>Common</h3>
            <Flex gap="middle" wrap>
              <SettingsItemPx
                label="Font size (px)"
                varName="--purefi_font_size"
              />

              <SettingsItemColor
                label="Primary font color"
                varName="--purefi_primary_font_color"
              />

              <SettingsItemColor
                label="Title color"
                varName="--purefi_title_color"
              />

              {/* <SettingsItemColor
                label="Spinner color"
                varName="--purefi_spinner_color"
              /> */}
            </Flex>
          </div>

          <div>
            <h3>Card</h3>
            <Flex gap="middle" wrap>
              <SettingsItemPx
                label="Card border radius (px)"
                varName="--purefi_card_border_radius"
              />

              <SettingsItemPx
                label="Card border width (px)"
                varName="--purefi_card_border_width"
              />

              <SettingsItemColor
                label="Card border color"
                varName="--purefi_card_border_color"
              />

              <SettingsItemColor
                label="Card label font color"
                varName="--purefi_card_label"
              />

              <SettingsItemColor
                label="Card bg color"
                varName="--purefi_card_bg_color"
              />
            </Flex>
          </div>

          <div>
            <h3>Button</h3>
            <Flex gap="middle" wrap>
              <SettingsItemPx
                label="Button border radius (px)"
                varName="--purefi_button_border_radius"
              />

              <SettingsItemColor
                label="Button font color"
                varName="--purefi_button_font_color"
              />

              <SettingsItemColor
                label="Button font hover color"
                varName="--purefi_button_font_color_hover"
              />

              <SettingsItemColor
                label="Button bg color"
                varName="--purefi_button_bg_color"
              />

              <SettingsItemColor
                label="Button bg hover color"
                varName="--purefi_button_bg_color_hover"
              />
            </Flex>
          </div>

          <div>
            <h3>Modal</h3>
            <Flex gap="middle" wrap>
              <SettingsItemPx
                label="Modal border radius (px)"
                varName="--purefi_modal_border_radius"
              />
              <SettingsItemColor
                label="Modal font color"
                varName="--purefi_modal_font_color"
              />
              <SettingsItemColor
                label="Modal bg color"
                varName="--purefi_modal_bg_color"
              />
            </Flex>
          </div>
        </Flex>
      </Drawer>
    </div>
  );
};

export default WidgetSettings;
