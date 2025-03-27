/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, FC, useEffect, useState } from 'react';
import {
  PackageType,
  PureFI,
  PureFIError,
  PureFIErrorCodes,
  PureFIRuleV5Payload,
  RuleV5Data,
  RuleV5Payload,
  SignatureType,
  createDomain,
  createRuleV5Types,
} from '@purefi/verifier-sdk';
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space,
} from 'antd';

import styles from './Playground.module.scss';
import {
  BaseError,
  createWalletClient,
  custom,
  parseUnits,
  zeroAddress,
} from 'viem';
import { useAccount } from 'wagmi';
import { checkIfChainSupported } from '@/utils';
import { useMediaQuery } from 'react-responsive';
import { DEFAULT_CHAIN_VIEM } from '@/config';

enum PresetTypeEnum {
  'CUSTOM' = 0,
  'PUREFI_AML' = 1,
  'PUREFI_KYC' = 2,
}

enum TestEnum {
  SIX = 6,
  BEX = 18,
}

interface PayloadFields {
  packageType?: string;
  ruleId?: string;
  toAddress?: string;
  fromAddress?: string;
  intermediaryAddress?: string;
  payeeAddress?: string;
  token0Address?: string;
  token0Value?: string;
  token0Decimals?: number;
  token1Address?: string;
  token1Value?: string;
  token1Decimals?: number;
  tokenPaymentAddress?: string;
  tokenPaymentValue?: string;
  tokenPaymentDecimals?: number;
}

interface BasicSettingsFields {
  issuerUrl?: string;
  customSigner?: boolean;
  customSignerUrl?: string;
}

interface VerificationProcessFormFields {
  signatureType?: string;
}

const ISSUER_API_URL_STAGE = import.meta.env.VITE_ISSUER_API_URL_STAGE;
const ISSUER_API_URL_PROD = import.meta.env.VITE_ISSUER_API_URL_PROD;

const PUREFI_DEMO_CONTRACT = '0xd9f7c12906af9fd2264967fc7d4faa8a08d09dfa';

const PACKAGE_TYPE_OPTIONS = [
  {
    label: '0',
    value: '0',
  },
  {
    label: '32',
    value: '32',
  },
  {
    label: '48',
    value: '48',
  },
  {
    label: '64',
    value: '64',
  },
  {
    label: '96',
    value: '96',
  },
  {
    label: '112',
    value: '112',
  },
  {
    label: '128',
    value: '128',
  },
  {
    label: '160',
    value: '160',
  },
  {
    label: '176',
    value: '176',
  },
  {
    label: '192',
    value: '192',
  },
  {
    label: '224',
    value: '224',
  },
  {
    label: '240',
    value: '240',
  },
];

const PRESET_TYPE_OPTIONS = [
  {
    label: 'Custom',
    value: PresetTypeEnum.CUSTOM,
  },
  {
    label: 'PureFi AML',
    value: PresetTypeEnum.PUREFI_AML,
  },
  {
    label: 'PureFi KYC',
    value: PresetTypeEnum.PUREFI_KYC,
  },
];

const Playground: FC = () => {
  const isMobile = useMediaQuery({
    query: '(max-width: 992px)',
  });

  const account = useAccount();

  const isWalletConnected = account.isConnected;
  const isChainSupported = checkIfChainSupported(account.chainId);
  const isReady = isWalletConnected && isChainSupported;

  const [purefiError, setPurefiError] = useState<string | null>(null);
  const [isVerificationAllowed, setIsVerificationAllowed] = useState(false);

  const [purefiPayload, setPurefiPayload] =
    useState<PureFIRuleV5Payload | null>(null);
  const [purefiData, setPurefiData] = useState<string | null>(null);

  const [signatureLoading, setSignatureLoading] = useState(false);
  const [customSignerLoading, setCustomSignerLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const [basicSettingsForm] = Form.useForm();

  const issuerUrlValue = Form.useWatch('issuerUrl', basicSettingsForm);
  const customSignerValue = Form.useWatch('customSigner', basicSettingsForm);
  const customSignerUrlValue = Form.useWatch(
    'customSignerUrl',
    basicSettingsForm
  );

  const basicSettingsFormChangeHandler = (fields: BasicSettingsFields) => {
    if ('customSigner' in fields) {
      basicSettingsForm.setFields([
        {
          name: 'customSignerUrl',
          value: fields.customSigner ? 'http:localhost:5000/sign' : '',
        },
      ]);
    }
  };

  const [payloadForm] = Form.useForm();

  const packageTypeErrors = payloadForm.getFieldError('packageType');
  const ruleIdErrors = payloadForm.getFieldError('ruleId');
  const fromAddressErrors = payloadForm.getFieldError('fromAddress');
  const toAddressErrors = payloadForm.getFieldError('toAddress');
  const intermediaryAddressErrors = payloadForm.getFieldError(
    'intermediaryAddress'
  );
  const payeeAddressErrors = payloadForm.getFieldError('payeeAddress');
  const token0AddressErrors = payloadForm.getFieldError('token0Address');
  const token0ValueErrors = payloadForm.getFieldError('token0Value');
  const token0DecimalsErrors = payloadForm.getFieldError('token0Decimals');
  const token1AddressErrors = payloadForm.getFieldError('token1Address');
  const token1ValueErrors = payloadForm.getFieldError('token1Value');
  const token1DecimalsErrors = payloadForm.getFieldError('token1Decimals');
  const tokenPaymentAddressErrors = payloadForm.getFieldError(
    'tokenPaymentAddress'
  );
  const tokenPaymentValueErrors =
    payloadForm.getFieldError('tokenPaymentValue');
  const tokenPaymentDecimalsErrors = payloadForm.getFieldError(
    'tokenPaymentDecimals'
  );

  const packageTypeValue = Form.useWatch('packageType', payloadForm);
  const ruleIdValue = Form.useWatch('ruleId', payloadForm);
  const fromAddressValue = Form.useWatch('fromAddress', payloadForm);
  const toAddressValue = Form.useWatch('toAddress', payloadForm);
  const intermediaryAddressValue = Form.useWatch(
    'intermediaryAddress',
    payloadForm
  );
  const payeeAddressValue = Form.useWatch('payeeAddress', payloadForm);
  const token0AddressValue = Form.useWatch('token0Address', payloadForm);
  const token0ValueValue = Form.useWatch('token0Value', payloadForm);
  const token0DecimalsValue = Form.useWatch('token0Decimals', payloadForm);
  const token1AddressValue = Form.useWatch('token1Address', payloadForm);
  const token1ValueValue = Form.useWatch('token1Value', payloadForm);
  const token1DecimalsValue = Form.useWatch('token1Decimals', payloadForm);
  const tokenPaymentAddressValue = Form.useWatch(
    'tokenPaymentAddress',
    payloadForm
  );
  const tokenPaymentValueValue = Form.useWatch(
    'tokenPaymentValue',
    payloadForm
  );
  const tokenPaymentDecimalsValue = Form.useWatch(
    'tokenPaymentDecimals',
    payloadForm
  );

  const payloadFormChangeHandler = (fields: PayloadFields) => {
    console.log(fields);
  };

  const [verificationProcessForm] = Form.useForm();

  const verificationProcessFormChangeHandler = (
    fields: VerificationProcessFormFields
  ) => {
    console.log(fields);
  };

  const signatureTypeValue = Form.useWatch(
    'signatureType',
    verificationProcessForm
  );

  const [presetType, setPresetType] = useState<PresetTypeEnum>(
    PresetTypeEnum.CUSTOM
  );

  const presetTypeChangeHandler = (e: RadioChangeEvent) => {
    setPresetType(e.target.value);
  };

  const signMessageHandler = async () => {
    try {
      setSignatureLoading(true);

      const walletClient = createWalletClient({
        chain: account.chain!,
        transport: custom((window as any).ethereum!),
      });

      const [address] = await walletClient.getAddresses();

      const domain = createDomain('PureFi', account.chainId!);

      const ruleV5Payload: RuleV5Payload = {
        ruleId: '431050',
        from: account.address!,
        to: '0xd9f7c12906af9fd2264967fc7d4faa8a08d09dfa',
        tokenData0: {
          address: zeroAddress,
          value: parseUnits('0.001', 18).toString(),
          decimals: '18',
        },
        packageType: '32',
      };

      const ruleV5Data: RuleV5Data = {
        account: {
          address: account.address!,
        },
        chain: {
          id: account.chainId!.toString(),
        },
        payload: ruleV5Payload,
      };

      const ruleV5Types = createRuleV5Types(ruleV5Payload);

      const signature = await walletClient.signTypedData({
        account: address,
        domain,
        types: ruleV5Types,
        primaryType: 'Data',
        message: ruleV5Data,
      });

      const payload: PureFIRuleV5Payload = {
        message: ruleV5Data,
        signature,
      };

      setPurefiPayload(payload);
    } catch (error: unknown) {
      const theError = error as BaseError;
      console.log(theError.shortMessage);
    } finally {
      setSignatureLoading(false);
    }
  };

  const customSignerHandler = async () => {
    try {
      setCustomSignerLoading(true);

      const domain = createDomain('PureFi', account.chainId!);

      const ruleV5Payload: RuleV5Payload = {
        ruleId: '431050',
        from: account.address!,
        to: '0xd9f7c12906af9fd2264967fc7d4faa8a08d09dfa',
        tokenData0: {
          address: zeroAddress,
          value: parseUnits('0.001', 18).toString(),
          decimals: '18',
        },
        packageType: '32',
      };

      const ruleV5Data: RuleV5Data = {
        account: {
          address: account.address!,
        },
        chain: {
          id: account.chainId!.toString(),
        },
        payload: ruleV5Payload,
      };

      const ruleV5Types = createRuleV5Types(ruleV5Payload);

      const payload = {
        domain,
        types: ruleV5Types,
        primaryType: 'Data',
        message: ruleV5Data,
      };

      const response = await fetch(customSignerUrlValue, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const payload: PureFIRuleV5Payload = await response.json();
        setPurefiPayload(payload);
      } else {
        const errorData = await response.json();

        throw new Error(errorData.message);
      }
    } catch (error: unknown) {
      const theError = error as Error;
      console.log(theError.message);
    } finally {
      setCustomSignerLoading(false);
    }
  };

  const verifyUserHandler = async () => {
    try {
      setVerificationLoading(true);

      PureFI.setIssuerUrl(issuerUrlValue);

      const data = await PureFI.verifyRuleV5(purefiPayload!);

      setPurefiData(data);
    } catch (error: unknown) {
      const theError = error as PureFIError;

      setPurefiError(theError.message);

      if (theError.code === PureFIErrorCodes.FORBIDDEN) {
        setIsVerificationAllowed(true);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  const isReadonly = presetType !== PresetTypeEnum.CUSTOM;

  const isIntermediaryHidden = ['0', '32', '48', '64', '96', '112'].includes(
    packageTypeValue
  );
  const isPayeeHidden = ['0', '32', '48', '128', '160', '176'].includes(
    packageTypeValue
  );
  const isToken0Hidden = ['0', '64', '128', '192'].includes(packageTypeValue);
  const isToken1Hidden = [
    '0',
    '32',
    '64',
    '96',
    '128',
    '160',
    '192',
    '224',
  ].includes(packageTypeValue);
  const isTokenPaymentHidden = ['0', '32', '48', '128', '160', '176'].includes(
    packageTypeValue
  );

  const isCustomSignerUrlHidden = !customSignerValue;

  const data: RuleV5Data = {
    account: {
      address: account.address!,
    },
    chain: {
      id: account.chainId!.toString(),
    },
    payload: {
      packageType: packageTypeValue,
      ruleId: ruleIdErrors.length === 0 ? ruleIdValue : '',
      from: fromAddressErrors.length === 0 ? fromAddressValue : '',
      to: toAddressErrors.length === 0 ? toAddressValue : toAddressErrors,
      ...(!isIntermediaryHidden && {
        intermediary:
          intermediaryAddressErrors.length === 0
            ? intermediaryAddressValue
            : '',
      }),
      ...(!isPayeeHidden && {
        payee: payeeAddressErrors.length === 0 ? payeeAddressValue : '',
      }),
      ...(!isToken0Hidden && {
        tokenData0: {
          address: token0AddressErrors.length === 0 ? token0AddressValue : '',
          value:
            token0ValueValue &&
            token0DecimalsValue &&
            token0ValueErrors.length === 0 &&
            token0DecimalsErrors.length === 0
              ? parseUnits(token0ValueValue, token0DecimalsValue).toString()
              : '',
          decimals:
            token0DecimalsValue && token0DecimalsErrors.length === 0
              ? token0DecimalsValue.toString()
              : '',
        },
      }),
      ...(!isToken1Hidden && {
        tokenData1: {
          address: token1AddressErrors.length === 0 ? token1AddressValue : '',
          value:
            token1ValueValue &&
            token1DecimalsValue &&
            token1ValueErrors.length === 0 &&
            token1DecimalsErrors.length === 0
              ? parseUnits(token1ValueValue, token1DecimalsValue).toString()
              : '',
          decimals:
            token1DecimalsValue && token1DecimalsErrors.length === 0
              ? token1DecimalsValue.toString()
              : '',
        },
      }),
      ...(!isTokenPaymentHidden && {
        paymentData: {
          address:
            tokenPaymentAddressErrors.length === 0
              ? tokenPaymentAddressValue
              : '',
          value:
            tokenPaymentValueValue &&
            tokenPaymentDecimalsValue &&
            tokenPaymentValueErrors.length === 0 &&
            tokenPaymentDecimalsErrors.length === 0
              ? parseUnits(
                  tokenPaymentValueValue,
                  tokenPaymentDecimalsValue
                ).toString()
              : '',
          decimals:
            tokenPaymentDecimalsValue && tokenPaymentDecimalsErrors.length === 0
              ? tokenPaymentDecimalsValue.toString()
              : '',
        },
      }),
    },
  };

  const payloadConstructorTitle = (
    <Row gutter={[8, 8]}>
      <Col className="gutter-row" xs={24} lg={12}>
        <h3>Payload Constructor</h3>
      </Col>
      <Col className="gutter-row" xs={24} lg={12}>
        <Form.Item
          label="Presets"
          tooltip="Create custom payload or explore predefined PureFi presets"
          colon={false}
          style={{ margin: '16px 0' }}
        >
          <Radio.Group
            value={presetType}
            options={PRESET_TYPE_OPTIONS}
            onChange={presetTypeChangeHandler}
            optionType="button"
            block
          />
        </Form.Item>
      </Col>
    </Row>
  );

  const resetPayloadFormHandler = () => {
    payloadForm.resetFields();
  };

  const validatePayloadHandler = async () => {
    await payloadForm.validateFields();
  };

  useEffect(() => {
    if (presetType === PresetTypeEnum.PUREFI_AML) {
      payloadForm.setFields([
        {
          name: 'packageType',
          value: '32',
        },
        {
          name: 'ruleId',
          value: '431050',
        },
        {
          name: 'toAddress',
          value: PUREFI_DEMO_CONTRACT,
        },
        {
          name: 'token0Address',
          value: zeroAddress,
        },
        {
          name: 'token0Value',
          value: '0.001',
        },
        {
          name: 'token0Decimals',
          value: 18,
        },
      ]);
      validatePayloadHandler();
    } else if (presetType === PresetTypeEnum.PUREFI_KYC) {
      payloadForm.setFields([
        {
          name: 'packageType',
          value: '32',
        },
        {
          name: 'ruleId',
          value: '731',
        },
        {
          name: 'toAddress',
          value: PUREFI_DEMO_CONTRACT,
        },
        {
          name: 'token0Address',
          value: zeroAddress,
        },
        {
          name: 'token0Value',
          value: '0.001',
        },
        {
          name: 'token0Decimals',
          value: 18,
        },
      ]);
      validatePayloadHandler();
    }
  }, [presetType]);

  return (
    <div className={styles.playground}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title={payloadConstructorTitle} size="small">
          <Row gutter={[24, 8]} align="stretch">
            <Col className="gutter-row" xs={24} lg={12}>
              <Form
                layout="vertical"
                initialValues={{
                  packageType: '0',
                  ruleId: '',
                  toAddress: '',
                  fromAddress: account?.address || '',
                  intermediaryAddress: '',
                  payeeAddress: '',
                  token0Address: '',
                  token0Value: '',
                  token0Decimals: 18,
                  token1Address: '',
                  token1Value: '',
                  token1Decimals: 18,
                  tokenPaymentAddress: '',
                  tokenPaymentValue: '',
                  tokenPaymentDecimals: 18,
                }}
                form={payloadForm}
                onValuesChange={payloadFormChangeHandler}
                autoComplete="off"
              >
                <Form.Item
                  label="Package Type"
                  name="packageType"
                  rules={[{ required: true }]}
                  hasFeedback
                >
                  <Select
                    options={PACKAGE_TYPE_OPTIONS}
                    disabled={isReadonly}
                  />
                </Form.Item>

                <Form.Item
                  label="Rule Id"
                  name="ruleId"
                  rules={[
                    {
                      required: true,
                      validator: (rule, value) => {
                        if (value === '') {
                          return Promise.reject(
                            new Error('Please enter Rule Id')
                          );
                        }

                        if (+value <= 0) {
                          return Promise.reject(
                            new Error('Rule Id must be positive numeric string')
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input
                    type="number"
                    placeholder="431050"
                    readOnly={isReadonly}
                    disabled={isReadonly}
                  />
                </Form.Item>

                <Form.Item
                  label="From (Address)"
                  name="fromAddress"
                  rules={[
                    {
                      required: true,
                    },
                    {
                      pattern: /^(0x)[0-9a-fA-F]{40}$/,
                      message: 'From (Address) Invalid',
                    },
                  ]}
                  hasFeedback
                >
                  <Input placeholder={zeroAddress} />
                </Form.Item>

                <Form.Item
                  label="To (Address)"
                  name="toAddress"
                  rules={[
                    {
                      required: true,
                    },
                    {
                      pattern: /^(0x)[0-9a-fA-F]{40}$/,
                      message: 'To (Address) Invalid',
                    },
                  ]}
                  hasFeedback
                >
                  <Input
                    placeholder={zeroAddress}
                    readOnly={isReadonly}
                    disabled={isReadonly}
                  />
                </Form.Item>

                <Form.Item
                  label="Intermediary (Address)"
                  name="intermediaryAddress"
                  dependencies={['packageType']}
                  hidden={isIntermediaryHidden}
                  rules={[
                    { required: !isIntermediaryHidden },
                    {
                      pattern: /^(0x)[0-9a-fA-F]{40}$/,
                      message: 'Intermediary (Address) Invalid',
                    },
                  ]}
                  hasFeedback
                >
                  <Input
                    placeholder={zeroAddress}
                    readOnly={isReadonly}
                    disabled={isReadonly}
                  />
                </Form.Item>

                <Form.Item
                  label="Payee (Address)"
                  name="payeeAddress"
                  hidden={isPayeeHidden}
                  dependencies={['packageType']}
                  rules={[
                    { required: !isPayeeHidden },
                    {
                      pattern: /^(0x)[0-9a-fA-F]{40}$/,
                      message: 'Payee (Address) Invalid',
                    },
                  ]}
                  hasFeedback
                >
                  <Input
                    placeholder={zeroAddress}
                    readOnly={isReadonly}
                    disabled={isReadonly}
                  />
                </Form.Item>

                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" xs={24} lg={14}>
                    <Form.Item
                      label="Token0 (Address)"
                      name="token0Address"
                      tooltip="Zero address means a native coin (ETH, POL, etc.)"
                      hidden={isToken0Hidden}
                      dependencies={['packageType']}
                      rules={[
                        { required: !isToken0Hidden },
                        {
                          pattern: /^(0x)[0-9a-fA-F]{40}$/,
                          message: 'Token0 (Address) Invalid',
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        placeholder={zeroAddress}
                        readOnly={isReadonly}
                        disabled={isReadonly}
                      />
                    </Form.Item>
                  </Col>

                  <Col className="gutter-row" xs={24} lg={5}>
                    <Form.Item
                      label="Value"
                      name="token0Value"
                      hidden={isToken0Hidden}
                      dependencies={['packageType']}
                      rules={[
                        {
                          required: !isToken0Hidden,
                          validator: (rule, value) => {
                            if (!rule?.required) {
                              return Promise.resolve();
                            }

                            if (value === '') {
                              return Promise.reject(
                                new Error('Please enter Value')
                              );
                            }

                            if (+value <= 0) {
                              return Promise.reject(
                                new Error(
                                  'Value must be positive. Min value is 0.001'
                                )
                              );
                            }

                            return Promise.resolve();
                          },
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        type="number"
                        step={0.001}
                        min={0.001}
                        placeholder="0.001"
                      />
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" xs={24} lg={5}>
                    <Form.Item
                      label="Decimals"
                      name="token0Decimals"
                      hidden={isToken0Hidden}
                      dependencies={['packageType']}
                      rules={[
                        {
                          required: !isToken0Hidden,
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        placeholder="18"
                        readOnly={isReadonly}
                        disabled={isReadonly}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" xs={24} lg={14}>
                    <Form.Item
                      label="Token1 (Address)"
                      name="token1Address"
                      tooltip="Zero address means a native coin (ETH, POL, etc.)"
                      hidden={isToken1Hidden}
                      dependencies={['packageType']}
                      rules={[
                        { required: !isToken1Hidden },
                        {
                          pattern: /^(0x)[0-9a-fA-F]{40}$/,
                          message: 'Token1 (Address) Invalid',
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        placeholder={zeroAddress}
                        readOnly={isReadonly}
                        disabled={isReadonly}
                      />
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" xs={24} lg={5}>
                    <Form.Item
                      label="Value"
                      name="token1Value"
                      hidden={isToken1Hidden}
                      dependencies={['packageType']}
                      rules={[
                        {
                          required: !isToken1Hidden,
                          validator: (rule, value) => {
                            if (!rule?.required) {
                              return Promise.resolve();
                            }

                            if (value === '') {
                              return Promise.reject(
                                new Error('Please enter Value')
                              );
                            }

                            if (+value <= 0) {
                              return Promise.reject(
                                new Error(
                                  'Value must be positive. Min value is 0.001'
                                )
                              );
                            }

                            return Promise.resolve();
                          },
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        type="number"
                        step={0.001}
                        min={0.001}
                        placeholder="0.001"
                      />
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" xs={24} lg={5}>
                    <Form.Item
                      label="Decimals"
                      name="token1Decimals"
                      hidden={isToken1Hidden}
                      dependencies={['packageType']}
                      rules={[
                        {
                          required: !isToken1Hidden,
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        placeholder="18"
                        readOnly={isReadonly}
                        disabled={isReadonly}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" xs={24} lg={14}>
                    <Form.Item
                      label="Token Payment (Address)"
                      name="tokenPaymentAddress"
                      tooltip="Zero address means a native coin (ETH, POL, etc.)"
                      hidden={isTokenPaymentHidden}
                      dependencies={['packageType']}
                      rules={[
                        { required: !isTokenPaymentHidden },
                        {
                          pattern: /^(0x)[0-9a-fA-F]{40}$/,
                          message: 'Token Payment (Address) Invalid',
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        placeholder={zeroAddress}
                        readOnly={isReadonly}
                        disabled={isReadonly}
                      />
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" xs={24} lg={5}>
                    <Form.Item
                      label="Value"
                      name="tokenPaymentValue"
                      hidden={isTokenPaymentHidden}
                      dependencies={['packageType']}
                      rules={[
                        {
                          required: !isTokenPaymentHidden,
                          validator: (rule, value) => {
                            if (!rule?.required) {
                              return Promise.resolve();
                            }

                            if (value === '') {
                              return Promise.reject(
                                new Error('Please enter Value')
                              );
                            }

                            if (+value <= 0) {
                              return Promise.reject(
                                new Error(
                                  'Value must be positive. Min value is 0.001'
                                )
                              );
                            }

                            return Promise.resolve();
                          },
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        type="number"
                        step={0.001}
                        min={0.001}
                        placeholder="0.001"
                      />
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" xs={24} lg={5}>
                    <Form.Item
                      label="Decimals"
                      name="tokenPaymentDecimals"
                      hidden={isTokenPaymentHidden}
                      rules={[
                        {
                          required: !isTokenPaymentHidden,
                        },
                      ]}
                      hasFeedback
                    >
                      <Input
                        placeholder="18"
                        readOnly={isReadonly}
                        disabled={isReadonly}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginTop: 10 }}>
                  <Flex vertical gap="8px">
                    <Button
                      onClick={validatePayloadHandler}
                      color="primary"
                      variant="outlined"
                      block
                    >
                      Validate Payload
                    </Button>
                    <Button
                      onClick={resetPayloadFormHandler}
                      type="primary"
                      variant="outlined"
                      ghost
                      danger
                      block
                    >
                      Reset Fields
                    </Button>
                  </Flex>
                </Form.Item>
              </Form>
            </Col>
            <Col
              className="gutter-row"
              xs={24}
              lg={12}
              style={{ height: '100%' }}
            >
              <div style={{ paddingBottom: 8 }}>Result</div>
              <div className={styles.playground__payload}>
                <pre>{JSON.stringify(data, null, 4)}</pre>
              </div>
            </Col>
          </Row>
        </Card>

        <Card title={<h3>Signature Process</h3>} size="small">
          <Row gutter={[24, 8]} align="stretch">
            <Col className="gutter-row" xs={24} lg={12}>
              <Form
                layout="vertical"
                initialValues={{
                  signatureType: SignatureType.ECDSA,
                }}
                form={verificationProcessForm}
                onValuesChange={verificationProcessFormChangeHandler}
                autoComplete="off"
              >
                <Form.Item
                  label="PureFi Issuer Signature Algorithm"
                  name="signatureType"
                >
                  <Radio.Group
                    optionType="button"
                    options={[
                      {
                        value: SignatureType.ECDSA,
                        label: SignatureType.ECDSA.toUpperCase(),
                      },
                      {
                        value: SignatureType.BABYJUBJUB,
                        label: SignatureType.BABYJUBJUB.toUpperCase(),
                      },
                    ]}
                    block
                  />
                </Form.Item>
              </Form>
            </Col>
            <Col
              className="gutter-row"
              xs={24}
              lg={12}
              style={{ height: '100%' }}
            >
              <div style={{ paddingBottom: 8 }}>Result</div>
              <div className={styles.playground__payload}>
                <pre></pre>
              </div>
            </Col>
          </Row>
        </Card>

        <Card title={<h3>Basic Settings</h3>} size="small">
          <Row gutter={[8, 8]}>
            <Col className="gutter-row" xs={24} lg={14}>
              <Form
                layout="vertical"
                form={basicSettingsForm}
                initialValues={{
                  issuerUrl: ISSUER_API_URL_STAGE,
                  customSigner: false,
                  customSignerUrl: '',
                }}
                onValuesChange={basicSettingsFormChangeHandler}
                autoComplete="off"
              >
                <Row gutter={[8, 8]} align="bottom">
                  <Col className="gutter-row" xs={24} lg={14}>
                    <Form.Item
                      className={styles.some}
                      label="PureFi Issuer URL"
                      name="issuerUrl"
                    >
                      <Radio.Group
                        optionType="button"
                        options={[
                          {
                            value: ISSUER_API_URL_STAGE,
                            label: 'STAGE',
                          },
                          {
                            value: ISSUER_API_URL_PROD,
                            label: 'PROD',
                          },
                        ]}
                        block
                      />
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" xs={24} lg={10}>
                    <Form.Item name="issuerUrl">
                      <Input variant="filled" readOnly />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[8, 8]} align="bottom">
                  <Col className="gutter-row" xs={24} lg={14}>
                    <Form.Item
                      className={styles.some}
                      label="Partner's Custom Signer Backend URL"
                      name="customSigner"
                    >
                      <Radio.Group
                        optionType="button"
                        options={[
                          {
                            value: false,
                            label: 'NONE',
                          },
                          {
                            value: true,
                            label: 'CUSTOM',
                          },
                        ]}
                        block
                      />
                    </Form.Item>
                  </Col>

                  <Col className="gutter-row" xs={24} lg={10}>
                    <Form.Item
                      name="customSignerUrl"
                      hidden={isCustomSignerUrlHidden}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default Playground;
