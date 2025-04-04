import { FC, useEffect, useRef, useState } from 'react';
import {
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
  Modal,
  Radio,
  RadioChangeEvent,
  Result,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Tour,
  TourProps,
  Typography,
} from 'antd';

import {
  BaseError,
  createWalletClient,
  custom,
  parseUnits,
  zeroAddress,
} from 'viem';

import { useAccount } from 'wagmi';

import { checkIfChainSupported, sleep } from '@/utils';
import { useMediaQuery } from 'react-responsive';
import {
  ExportOutlined,
  FireOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

import styles from './Playground.module.scss';
import { ConnectButton } from '../ConnectButton';
import { Link } from 'react-router-dom';
import { PUREFI_DEMO_CONTRACT_ABI } from '@/abi';

enum PresetTypeEnum {
  CUSTOM = 0,
  PUREFI_AML = 1,
  PUREFI_KYC = 2,
}

enum ImplementationEnum {
  FRONTEND = 0,
  BACKEND = 1,
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

interface SignatureProcessFields {
  customSignerUrl?: string;
  accountAddress?: string;
  chainId?: number;
}

interface VerificationProcessFormFields {
  issuerUrl?: string;
  signatureType?: string;
}

const ISSUER_API_URL_STAGE = import.meta.env.VITE_ISSUER_API_URL_STAGE;
const DASHBOARD_URL_STAGE = import.meta.env.VITE_DASHBOARD_URL_STAGE;
const ISSUER_API_URL_PROD = import.meta.env.VITE_ISSUER_API_URL_PROD;
const DASHBOARD_URL_PROD = import.meta.env.VITE_DASHBOARD_URL_PROD;
const PUREFI_DEMO_CONTRACT = import.meta.env.VITE_PUREFI_DEMO_CONTRACT;

const PACKAGE_TYPE_OPTIONS = [
  {
    label: 'Basic',
    title: 'Basic',
    options: [
      {
        label: 'Type 0',
        value: '0',
        desc: 'rule, from, to',
        title: 'Type 0 (rule, from, to)',
      },
      {
        label: 'Type 32',
        value: '32',
        desc: 'rule, from, to, tokenData0',
        title: 'Type 32 (rule, from, to, tokenData0)',
      },
      {
        label: 'Type 48',
        value: '48',
        desc: 'rule, from, to, tokenData0, tokenData1',
        title: 'Type 48 (rule, from, to, tokenData0, tokenData1)',
      },
    ],
  },
  {
    label: '+ Intermediary',
    title: 'Intermediary',
    options: [
      {
        label: 'Type 128',
        value: '128',
        desc: 'rule, from, to, intermediary',
        title: 'Type 128 (rule, from, to, intermediary)',
      },
      {
        label: 'Type 160',
        value: '160',
        desc: 'rule, from, to, intermediary, tokenData0',
        title: 'Type 160 (rule, from, to, intermediary, tokenData0)',
      },
      {
        label: 'Type 176',
        value: '176',
        desc: 'rule, from, to, intermediary, tokenData0, tokenData1',
        title:
          'Type 176 (rule, from, to, intermediary, tokenData0, tokenData1)',
      },
    ],
  },
  {
    label: '+ Payee',
    title: 'Payee',
    options: [
      {
        label: 'Type 64',
        value: '64',
        desc: 'rule, from, to, payee, paymentData',
        title: 'Type 64 (rule, from, to, payee, paymentData)',
      },
      {
        label: 'Type 96',
        value: '96',
        desc: 'rule, from, to, payee, paymentData, tokenData0',
        title: 'Type 96 (rule, from, to, payee, paymentData, tokenData0)',
      },
      {
        label: 'Type 112',
        value: '112',
        desc: 'rule, from, to, payee, paymentData, tokenData0, tokenData1',
        title:
          'Type 112 (rule, from, to, payee, paymentData, tokenData0, tokenData1)',
      },
    ],
  },
  {
    label: '+ Intermediary + Payee',
    title: 'Intermediary & Payee',
    options: [
      {
        label: 'Type 192',
        value: '192',
        desc: 'rule, from, to, intermediary, payee, paymentData',
        title: 'Type 192 (rule, from, to, intermediary, payee, paymentData)',
      },
      {
        label: 'Type 224',
        value: '224',
        desc: 'rule, from, to, intermediary, payee, paymentData, tokenData0',
        title:
          'Type 224 (rule, from, to, intermediary, payee, paymentData, tokenData0)',
      },
      {
        label: 'Type 240',
        value: '240',
        desc: 'rule, from, to, intermediary, payee, paymentData, tokenData0, tokenData1',
        title:
          'Type 240 (rule, from, to, intermediary, payee, paymentData, tokenData0, tokenData1)',
      },
    ],
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

const IMPLEMENTATION_OPTIONS = [
  {
    value: ImplementationEnum.FRONTEND,
    label: "Partner's Frontend",
    title: "Partner's Frontend (User Wallet)",
  },
  {
    value: ImplementationEnum.BACKEND,
    label: "Partner's Backend",
    title: "Partner's Backend (Custom Signer)",
  },
];

const Playground: FC = () => {
  const isMobile = useMediaQuery({
    query: '(max-width: 992px)',
  });

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);

  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  const openTour = () => {
    setIsTourOpen(true);
  };
  const closeTour = () => {
    setIsTourOpen(false);
  };

  const steps: TourProps['steps'] = [
    {
      title: 'Step 1. Payload Constructor',
      description: 'Construct Rule Payload or use predefined PureFi presets',
      target: () => ref1.current,
    },
    {
      title: 'Step 2. Signature Process',
      description: 'Sign the Rule Payload obtained on the previous step',
      target: () => ref2.current,
    },
    {
      title: 'Step 3. Verification Process',
      description:
        'Finally, verify the PureFi Payload using corrsponding PureFi Issuer',
      target: () => ref3.current,
    },
    {
      title: 'PureFi Package',
      description:
        'In case of successfull verification, PureFi Issuer responds with PureFi Package that can be used as a payload for the following Smart Contract call',
      target: () => ref4.current,
    },
  ];

  const account = useAccount();

  useEffect(() => {
    signatureProcessForm.setFields([
      {
        name: 'accountAddress',
        value: account.address || '',
      },
    ]);
    payloadForm.setFields([
      {
        name: 'fromAddress',
        value: account.address || '',
      },
    ]);
    setPurefiPayload(null);
    setPurefiPackage(null);
  }, [account.address]);

  useEffect(() => {
    signatureProcessForm.setFields([
      {
        name: 'chainId',
        value: account.chainId || '',
      },
    ]);
    setPurefiPayload(null);
    setPurefiPackage(null);
  }, [account.chainId]);

  const [presetType, setPresetType] = useState<PresetTypeEnum>(
    PresetTypeEnum.CUSTOM
  );

  const [implementation, setImplementation] = useState<ImplementationEnum>(
    ImplementationEnum.FRONTEND
  );

  const isWalletConnected = account.isConnected;
  const isChainSupported = checkIfChainSupported(account.chainId);
  const isReady = isWalletConnected && isChainSupported;

  const [partnersFrontendError, setPartnersFrontendError] = useState<
    string | null
  >(null);
  const [partnersBackendError, setPartnersBackendError] = useState<
    string | null
  >(null);
  const [purefiError, setPurefiError] = useState<string | null>(null);

  const [isVerificationAllowed, setIsVerificationAllowed] = useState(false);

  const [isPartnersFrontendModalOpen, setIsPartnersFrontendModalOpen] =
    useState(false);
  const [isPartnersBackendModalOpen, setIsPartnersBackendModalOpen] =
    useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [purefiPayload, setPurefiPayload] =
    useState<PureFIRuleV5Payload | null>(null);

  const [ruleV5DataResult, setRuleV5DataResult] = useState<RuleV5Data | null>(
    null
  );

  const [purefiPackage, setPurefiPackage] = useState<string | null>(null);

  const [partnersFrontendLoading, setPartnersFrontendLoading] = useState(false);
  const [partnersBackendLoading, setPartnersBackendLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

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
    setPurefiPayload(null);
    setPurefiPackage(null);
  }, [presetType]);

  const isFrontendImplementation =
    implementation === ImplementationEnum.FRONTEND;

  useEffect(() => {
    if (isFrontendImplementation) {
      signatureProcessForm.setFields([
        {
          name: 'customSignerUrl',
          value: '',
        },
      ]);

      setRuleV5DataResult(null);
    } else {
      signatureProcessForm.setFields([
        {
          name: 'customSignerUrl',
          value: 'http://localhost:4000/sign',
        },
      ]);
      setRuleV5DataResult(null);
    }
    setPurefiPackage(null);
  }, [isFrontendImplementation]);

  const openPartnersFrontendModalHandler = () => {
    setIsPartnersFrontendModalOpen(true);
  };

  const closePartnersFrontendModalHandler = () => {
    if (!partnersFrontendLoading) {
      setIsPartnersFrontendModalOpen(false);
      setPartnersFrontendError(null);
    }
  };

  const openPartnersBackendModalOpen = () => {
    setIsPartnersBackendModalOpen(true);
  };

  const closePartnersBackendModalOpen = () => {
    if (!partnersBackendLoading) {
      setIsPartnersBackendModalOpen(false);
      setPartnersBackendError(null);
    }
  };

  const openVerificationModalHandler = () => {
    setIsVerificationModalOpen(true);
  };

  const closeVerificationModalHandler = () => {
    if (!verificationLoading) {
      setIsVerificationModalOpen(false);
      setIsVerificationAllowed(false);
      setPurefiError(null);
    }
  };

  const [payloadForm] = Form.useForm();

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

  const payloadFormChangeHandler = (fields: PayloadFields) => {
    setPurefiPayload(null);
    setPurefiPackage(null);
  };

  const [signatureProcessForm] = Form.useForm();

  const accountAddressValue = Form.useWatch(
    'accountAddress',
    signatureProcessForm
  );
  const chainIdValue = Form.useWatch('chainId', signatureProcessForm);

  const customSignerUrlValue = Form.useWatch(
    'customSignerUrl',
    signatureProcessForm
  );

  const accountAddressErrors = payloadForm.getFieldError('accountAddress');
  const chainIdErrors = payloadForm.getFieldError('chainId');

  const signatureProcessFormChangeHandler = (
    fields: SignatureProcessFields
  ) => {
    console.log('signatureProcessForm', fields);
  };

  const [verificationProcessForm] = Form.useForm();

  const issuerUrlValue = Form.useWatch('issuerUrl', verificationProcessForm);
  const signatureTypeValue = Form.useWatch(
    'signatureType',
    verificationProcessForm
  );

  const verificationProcessFormChangeHandler = (
    fields: VerificationProcessFormFields
  ) => {
    console.log('verificationProcessForm', fields);

    if ('signatureType' in fields) {
      setPurefiPackage(null);
    }
  };

  const presetTypeChangeHandler = (e: RadioChangeEvent) => {
    setPresetType(e.target.value);
  };

  const implementationChangeHandler = (e: RadioChangeEvent) => {
    setImplementation(e.target.value);
    setPurefiPayload(null);
    setPurefiPackage(null);
  };

  const validatePayload = async () => {
    try {
      await payloadForm.validateFields({ recursive: true });

      const isPayloadReady = [
        packageTypeErrors,
        ruleIdErrors,
        fromAddressErrors,
        toAddressErrors,
        intermediaryAddressErrors,
        payeeAddressErrors,
        token0AddressErrors,
        token0ValueErrors,
        token0DecimalsErrors,
        token1AddressErrors,
        token1ValueErrors,
        token1DecimalsErrors,
        tokenPaymentAddressErrors,
        tokenPaymentValueErrors,
        tokenPaymentDecimalsErrors,
      ].every((item) => item.length === 0);

      return isPayloadReady;
    } catch {
      return false;
    }
  };

  const validateAccount = async () => {
    try {
      await signatureProcessForm.validateFields({ recursive: true });

      const isAccountReady = [accountAddressErrors, chainIdErrors].every(
        (item) => item.length === 0
      );

      return isAccountReady;
    } catch {
      return false;
    }
  };

  const validateAll = async () => {
    const isPayloadReady = await validatePayload();
    const isAccountReady = await validateAccount();
    return isPayloadReady && isAccountReady;
  };

  const signatureFrontendHandler = async () => {
    const isReady = await validateAll();

    if (isReady) {
      try {
        openPartnersFrontendModalHandler();
        setPartnersFrontendLoading(true);

        const walletClient = createWalletClient({
          chain: account.chain!,
          transport: custom((window as any).ethereum!),
        });

        const [address] = await walletClient.getAddresses();

        const domain = createDomain('PureFi', account.chainId!);

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

        setRuleV5DataResult(ruleV5Data);
        setPurefiPayload(payload);
      } catch (error: unknown) {
        const theError = error as BaseError;
        setPartnersFrontendError(theError.shortMessage);
      } finally {
        setPartnersFrontendLoading(false);
      }
    }
  };

  const signatureBackendHandler = async () => {
    const isReady = await validateAll();

    if (isReady) {
      try {
        setPartnersBackendLoading(true);

        openPartnersBackendModalOpen();

        await sleep(1000);

        const requestBody = {
          chainId: chainIdValue,
          payload: ruleV5Payload,
        };

        const response = await fetch(customSignerUrlValue, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data: PureFIRuleV5Payload = await response.json();
          setRuleV5DataResult(data.message);
          setPurefiPayload(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
      } catch (error: unknown) {
        const theError = error as Error;
        setPartnersBackendError(theError.message);
      } finally {
        setPartnersBackendLoading(false);
      }
    }
  };

  const verificationHandler = async () => {
    if (purefiPayload) {
      try {
        setVerificationLoading(true);

        openVerificationModalHandler();

        await sleep(500);

        PureFI.setIssuerUrl(issuerUrlValue);

        const data = await PureFI.verifyRuleV5(
          purefiPayload,
          signatureTypeValue
        );

        setPurefiPackage(data);
      } catch (error: unknown) {
        const theError = error as PureFIError;

        const customizedError = theError.message.endsWith('undefined')
          ? theError.message.slice(
              0,
              theError.message.length - 'undefined'.length
            )
          : theError.message;

        setPurefiError(customizedError);

        if (theError.code === PureFIErrorCodes.FORBIDDEN) {
          setIsVerificationAllowed(true);
        }
      } finally {
        setVerificationLoading(false);
      }
    }
  };

  const smartContractCallHandler = async () => {
    try {
      if (isReady && purefiPackage) {
        const walletClient = createWalletClient({
          chain: account.chain!,
          transport: custom((window as any).ethereum!),
        });

        const data = await walletClient.writeContract({
          account: account.address!,
          address: PUREFI_DEMO_CONTRACT,
          abi: PUREFI_DEMO_CONTRACT_ABI,
          functionName: 'buyForWithKYCPurefi1',
          args: [account.address!, purefiPackage as `0x${string}`],
          value: parseUnits('0.0001', 18),
        });

        console.log(data);
      }
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const isPayloadReadonly = presetType !== PresetTypeEnum.CUSTOM;

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

  const isCustomSignerUrlHidden = isFrontendImplementation;

  const isAccountAddressHidden = !isCustomSignerUrlHidden;
  const isChainIdHidden = !isCustomSignerUrlHidden;

  const ruleV5Payload: RuleV5Payload = {
    packageType: packageTypeValue,
    ruleId: ruleIdErrors.length === 0 ? ruleIdValue : '',
    from: fromAddressErrors.length === 0 ? fromAddressValue : '',
    to: toAddressErrors.length === 0 ? toAddressValue : '',
    ...(!isIntermediaryHidden && {
      intermediary:
        intermediaryAddressErrors.length === 0 ? intermediaryAddressValue : '',
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
  };

  const ruleV5Data: RuleV5Data = {
    account: {
      address: accountAddressValue,
    },
    chain: {
      id: chainIdValue?.toString() || '',
    },
    payload: ruleV5Payload,
  };

  const payloadConstructorTitle = (
    <Row gutter={[16, 8]}>
      <Col className="gutter-row" xs={24} lg={12}>
        <h3>1. Payload Constructor</h3>
      </Col>
      <Col className="gutter-row" xs={24} lg={12}>
        <Form.Item
          label="Presets"
          tooltip="Construct custom payload or see in action a couple of predefined PureFi presets"
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

  const signatureProcessTitle = (
    <Row gutter={[16, 8]}>
      <Col className="gutter-row" xs={24} lg={12}>
        <h3>2. Signature Process</h3>
      </Col>
      <Col className="gutter-row" xs={24} lg={12}>
        <Form.Item
          label="Implementation"
          tooltip="Example of implementation, e.g. what is responsible for signing generated payload above"
          colon={false}
          style={{ margin: '16px 0' }}
        >
          <Radio.Group
            value={implementation}
            options={IMPLEMENTATION_OPTIONS}
            onChange={implementationChangeHandler}
            optionType="button"
            block
          />
        </Form.Item>
      </Col>
    </Row>
  );

  const resetPayloadFormHandler = () => {
    setPresetType(PresetTypeEnum.CUSTOM);
    payloadForm.resetFields();
    setPurefiPayload(null);
    setPurefiPackage(null);
  };

  const validatePayloadHandler = async () => {
    await payloadForm.validateFields();
  };

  const proceedToDashboard = () => {
    const dashboardUrl =
      issuerUrlValue === ISSUER_API_URL_STAGE
        ? DASHBOARD_URL_STAGE
        : DASHBOARD_URL_PROD;
    const specificDashboardUrl = `${dashboardUrl}/kyc`;
    window.open(specificDashboardUrl, '_blank');
  };

  return (
    <div className={styles.playground}>
      {!isReady && (
        <Flex align="center" justify="center" style={{ margin: '68px 0' }}>
          <ConnectButton />
        </Flex>
      )}

      {isReady && (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Row gutter={[16, 8]} align="stretch">
            <Col className="gutter-row" xs={24} lg={12}>
              <Typography.Text style={{ fontSize: 16 }}>
                <span style={{ paddingRight: 5 }}>
                  To get a high level picture of the process, please take a look
                  at
                </span>
                <Link
                  target="_blank"
                  rel="noopener norefferer"
                  to="https://docs.purefi.io/docs/overview"
                >
                  <span>Overview</span> <ExportOutlined />
                </Link>
                <span style={{ paddingLeft: 5 }}>section of the docs</span>
              </Typography.Text>
            </Col>
          </Row>
          <Row gutter={[16, 8]} align="stretch">
            <Col className="gutter-row" xs={24} lg={6}>
              <Button
                color="purple"
                variant="solid"
                onClick={openTour}
                icon={<FireOutlined />}
                block
              >
                Playground Quick Tour
              </Button>
            </Col>
          </Row>

          <Card title={payloadConstructorTitle} size="small" ref={ref1}>
            <Row gutter={[16, 8]} align="stretch">
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
                    tooltip="Determines package structure"
                    hasFeedback
                  >
                    <Select
                      options={PACKAGE_TYPE_OPTIONS}
                      disabled={isPayloadReadonly}
                      optionRender={(option) => {
                        console.log(option);

                        return (
                          <Space>
                            <Typography.Text>{option.label}</Typography.Text>
                            <Typography.Text type="secondary">
                              {/* @ts-ignore */}
                              {option.data?.desc}
                            </Typography.Text>
                          </Space>
                        );
                      }}
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
                              new Error(
                                'Rule Id must be positive numeric string'
                              )
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                    tooltip="Defines set of rules that will be applied by PureFi Issuer. Highly flexible parameter, must be disscussed with PureFi team"
                    hasFeedback
                  >
                    <Input
                      type="number"
                      placeholder="431050"
                      readOnly={isPayloadReadonly}
                      disabled={isPayloadReadonly}
                    />
                  </Form.Item>

                  <Form.Item
                    messageVariables={{ label: 'From (Address)' }}
                    label={
                      <Flex gap="4px" align="baseline">
                        <div>From (Address)</div>
                        {!!account?.address && (
                          <Button
                            type="link"
                            onClick={() => {
                              payloadForm.setFields([
                                {
                                  name: 'fromAddress',
                                  value: account.address!,
                                },
                              ]);
                              payloadForm.validateFields(['fromAddress']);
                            }}
                          >
                            (Injected)
                          </Button>
                        )}
                      </Flex>
                    }
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
                    tooltip="User wallet address"
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
                    tooltip="Smart contract address configured for the Subscription on PureFi Dashboard"
                    hasFeedback
                  >
                    <Input
                      placeholder={zeroAddress}
                      readOnly={isPayloadReadonly}
                      disabled={isPayloadReadonly}
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
                      readOnly={isPayloadReadonly}
                      disabled={isPayloadReadonly}
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
                      readOnly={isPayloadReadonly}
                      disabled={isPayloadReadonly}
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
                          readOnly={isPayloadReadonly}
                          disabled={isPayloadReadonly}
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
                          readOnly={isPayloadReadonly}
                          disabled={isPayloadReadonly}
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
                          readOnly={isPayloadReadonly}
                          disabled={isPayloadReadonly}
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
                          readOnly={isPayloadReadonly}
                          disabled={isPayloadReadonly}
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
                          readOnly={isPayloadReadonly}
                          disabled={isPayloadReadonly}
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
                          readOnly={isPayloadReadonly}
                          disabled={isPayloadReadonly}
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
                <Flex gap="8px" style={{ paddingBottom: 8 }}>
                  <Tag color="geekblue">OUTPUT</Tag>
                  <Tooltip title="This JSON will be used on the second step as a part of EIP-712 message Object">
                    <Typography.Text style={{ paddingRight: 8 }}>
                      Rule Payload
                    </Typography.Text>
                    <InfoCircleOutlined />
                  </Tooltip>
                </Flex>
                <div className={styles.playground__payload}>
                  <pre>{JSON.stringify(ruleV5Payload, null, 4)}</pre>
                  <Typography.Text
                    className={styles.playground__copy}
                    copyable={{ text: JSON.stringify(ruleV5Payload, null, 4) }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <Card title={signatureProcessTitle} size="small" ref={ref2}>
            <Row gutter={[16, 8]} align="stretch">
              <Col className="gutter-row" xs={24} lg={12}>
                <Form
                  layout="vertical"
                  initialValues={{
                    customSignerUrl: 'http://localhost:4000/sign',
                    accountAddress: account?.address || '',
                    chainId: account?.chainId || '',
                  }}
                  form={signatureProcessForm}
                  onValuesChange={signatureProcessFormChangeHandler}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Injected Wallet (Address)"
                    name="accountAddress"
                    hidden={isAccountAddressHidden}
                    required={!isAccountAddressHidden}
                    rules={[
                      {
                        required: !isAccountAddressHidden,
                      },
                      {
                        pattern: /^(0x)[0-9a-fA-F]{40}$/,
                        message: 'Injected Wallet (Address) Invalid',
                      },
                    ]}
                    hasFeedback
                  >
                    <Input readOnly />
                  </Form.Item>

                  <Form.Item
                    messageVariables={{ label: 'Chain Id' }}
                    label="Chain Id"
                    name="chainId"
                    hidden={isChainIdHidden}
                    required={!isChainIdHidden}
                    rules={[
                      {
                        required: true,
                        validator: (rule, value) => {
                          if (value === '') {
                            return Promise.reject(
                              new Error('Please enter Chain Id')
                            );
                          }

                          if (+value <= 0) {
                            return Promise.reject(
                              new Error('Chain Id Invalid')
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                    hasFeedback
                  >
                    <Input type="number" readOnly />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Flex gap="small">
                        <span>Partner's Custom Signer Backend URL</span>
                        <Link
                          target="_blank"
                          rel="noopener norefferer"
                          to="https://github.com/purefiprotocol/signer-backend"
                        >
                          <span>Github</span> <ExportOutlined />
                        </Link>
                      </Flex>
                    }
                    name="customSignerUrl"
                    hidden={isCustomSignerUrlHidden}
                    required={!isCustomSignerUrlHidden}
                    rules={[
                      {
                        required: !isCustomSignerUrlHidden,
                      },
                    ]}
                    tooltip="Public Address of Custom Signer must be configured for the Subscription on PureFi Dashboard"
                    hasFeedback
                  >
                    <Input addonBefore="POST" />
                  </Form.Item>

                  <Form.Item
                    label="Request body"
                    hidden={isCustomSignerUrlHidden}
                    required={!isCustomSignerUrlHidden}
                    rules={[
                      {
                        required: !isCustomSignerUrlHidden,
                      },
                    ]}
                    tooltip="Payload field is constructed on the previous step"
                  >
                    <div className={styles.playground__payload}>
                      <pre>
                        {JSON.stringify(
                          {
                            chainId: chainIdValue?.toString() || '',
                            payload: ruleV5Payload,
                          },
                          null,
                          4
                        )}
                      </pre>

                      <Typography.Text
                        className={styles.playground__copy}
                        copyable={{
                          text: JSON.stringify(
                            {
                              chainId: chainIdValue?.toString() || '',
                              payload: ruleV5Payload,
                            },
                            null,
                            4
                          ),
                        }}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item style={{ marginTop: 30 }}>
                    {isFrontendImplementation ? (
                      <Button
                        type="primary"
                        onClick={signatureFrontendHandler}
                        loading={partnersFrontendLoading}
                        block
                      >
                        Sign
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={signatureBackendHandler}
                        loading={partnersBackendLoading}
                        block
                      >
                        Send
                      </Button>
                    )}
                  </Form.Item>
                </Form>
              </Col>
              <Col
                className="gutter-row"
                xs={24}
                lg={12}
                style={{ height: '100%' }}
              >
                <Flex gap="10px" vertical>
                  <div>
                    <Flex gap="8px" style={{ paddingBottom: 8 }}>
                      <Tag
                        color={isFrontendImplementation ? 'purple' : 'geekblue'}
                      >
                        {isFrontendImplementation ? 'INPUT/OUTPUT' : 'OUTPUT'}
                      </Tag>
                      <Tooltip title="EIP-712 compliant message that contains few fields: account, chain and payload (which is known here as Rule Payload constructed above)">
                        <Typography.Text style={{ paddingRight: 8 }}>
                          PureFi Message
                        </Typography.Text>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Flex>

                    <div className={styles.playground__payload}>
                      <pre>
                        {isFrontendImplementation
                          ? JSON.stringify(ruleV5Data, null, 4)
                          : ruleV5DataResult
                          ? JSON.stringify(ruleV5DataResult, null, 4)
                          : ''}
                      </pre>

                      {!!(isFrontendImplementation
                        ? JSON.stringify(ruleV5Data, null, 4)
                        : ruleV5DataResult
                        ? JSON.stringify(ruleV5DataResult, null, 4)
                        : '') ? (
                        <Typography.Text
                          className={styles.playground__copy}
                          copyable={{
                            text: isFrontendImplementation
                              ? JSON.stringify(ruleV5Data, null, 4)
                              : ruleV5DataResult
                              ? JSON.stringify(ruleV5DataResult, null, 4)
                              : '',
                          }}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <Flex gap="8px" style={{ paddingBottom: 8 }}>
                      <Tag color="geekblue">OUTPUT</Tag>
                      <Tooltip title="EIP-712 signature">
                        <Typography.Text style={{ paddingRight: 8 }}>
                          EIP-712 Signature
                        </Typography.Text>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Flex>

                    <div className={styles.playground__payload}>
                      <pre>{purefiPayload ? purefiPayload.signature : ''}</pre>

                      {!!(purefiPayload ? purefiPayload.signature : '') ? (
                        <Typography.Text
                          className={styles.playground__copy}
                          copyable={{
                            text: purefiPayload ? purefiPayload.signature : '',
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </Flex>
              </Col>
            </Row>
          </Card>

          <Card
            title={<h3>3. Verification Process</h3>}
            size="small"
            ref={ref3}
          >
            <Row gutter={[16, 8]}>
              <Col className="gutter-row" xs={24} lg={12}>
                <Form
                  layout="vertical"
                  form={verificationProcessForm}
                  initialValues={{
                    signatureType: SignatureType.ECDSA,
                    issuerUrl: ISSUER_API_URL_STAGE,
                  }}
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
                          title: SignatureType.ECDSA,
                        },
                        {
                          value: SignatureType.BABYJUBJUB,
                          label: SignatureType.BABYJUBJUB.toUpperCase(),
                          title: SignatureType.BABYJUBJUB,
                        },
                      ]}
                      block
                    />
                  </Form.Item>

                  <Form.Item
                    label="PureFi Issuer URL"
                    name="issuerUrl"
                    required
                  >
                    <Radio.Group
                      optionType="button"
                      options={[
                        {
                          value: ISSUER_API_URL_STAGE,
                          label: 'STAGE',
                          title: `${ISSUER_API_URL_STAGE}/v5/rule`,
                        },
                        {
                          value: ISSUER_API_URL_PROD,
                          label: 'PROD',
                          title: `${ISSUER_API_URL_PROD}/v5/rule`,
                          disabled: true,
                        },
                      ]}
                      block
                    />
                  </Form.Item>

                  <Form.Item required>
                    <Input
                      addonBefore="POST"
                      value={`${issuerUrlValue}/v5/rule`}
                      readOnly
                    />
                  </Form.Item>

                  <Form.Item
                    label="Request body"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    tooltip="Request Body"
                    required
                  >
                    <div className={styles.playground__payload}>
                      <pre>
                        {purefiPayload
                          ? JSON.stringify(
                              {
                                ...purefiPayload,
                                signType: signatureTypeValue,
                              },
                              null,
                              4
                            )
                          : ''}
                      </pre>

                      {!!(purefiPayload
                        ? JSON.stringify(
                            {
                              ...purefiPayload,
                              signType: signatureTypeValue,
                            },
                            null,
                            4
                          )
                        : '') ? (
                        <Typography.Text
                          className={styles.playground__copy}
                          copyable={{
                            text: purefiPayload
                              ? JSON.stringify(
                                  {
                                    ...purefiPayload,
                                    signType: signatureTypeValue,
                                  },
                                  null,
                                  4
                                )
                              : '',
                          }}
                        />
                      ) : null}
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={verificationHandler}
                      loading={verificationLoading}
                      block
                    >
                      Send
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
              <Col
                className="gutter-row"
                xs={24}
                lg={12}
                style={{ height: '100%' }}
              >
                <Flex vertical gap="8px">
                  <div ref={ref4}>
                    <Flex gap="8px" style={{ paddingBottom: 8 }}>
                      <Tag color="geekblue">OUTPUT</Tag>
                      <Tooltip title="In case of successfull verification PureFi Issuer responds with 200 status code and plain text which is known as PureFi Package">
                        <Typography.Text style={{ paddingRight: 8 }}>
                          PureFi Package
                        </Typography.Text>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Flex>
                    <div className={styles.playground__payload}>
                      <pre>{purefiPackage ?? ''}</pre>

                      {!!(purefiPackage ?? '') ? (
                        <Typography.Text
                          className={styles.playground__copy}
                          copyable={{
                            text: purefiPackage ?? '',
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </Flex>
              </Col>
            </Row>
          </Card>

          {presetType === PresetTypeEnum.PUREFI_KYC && (
            <Card title={<h3>4. Smart Contract</h3>} size="small">
              <Row gutter={[16, 8]}>
                <Col className="gutter-row" xs={24} lg={12}>
                  <Button onClick={smartContractCallHandler}>Call</Button>
                </Col>
              </Row>
            </Card>
          )}
        </Space>
      )}

      <Tour open={isTourOpen} onClose={closeTour} steps={steps} />

      <Modal
        title="Signature (EIP-712)"
        open={isPartnersFrontendModalOpen}
        onCancel={closePartnersFrontendModalHandler}
        footer={null}
        maskClosable={false}
        destroyOnClose
        centered
      >
        <Flex align="center" gap="20px" vertical style={{ marginTop: 40 }}>
          {partnersFrontendLoading && (
            <>
              {partnersFrontendError == null && (
                <Flex align="center" gap="20px" vertical>
                  <LoadingOutlined style={{ fontSize: 40 }} />
                  <Typography.Text type="secondary">
                    Proceed in your wallet
                  </Typography.Text>
                </Flex>
              )}
            </>
          )}
          {!partnersFrontendLoading && (
            <>
              {partnersFrontendError !== null ? (
                <Result
                  status="error"
                  title="Error!"
                  subTitle={partnersFrontendError}
                  extra={[
                    <Button
                      type="primary"
                      onClick={closePartnersFrontendModalHandler}
                      block
                    >
                      OK
                    </Button>,
                  ]}
                />
              ) : (
                <Result
                  status="success"
                  title="Success!"
                  subTitle="Now you can follow next step"
                  extra={[
                    <Button
                      type="primary"
                      onClick={closePartnersFrontendModalHandler}
                      block
                    >
                      OK
                    </Button>,
                  ]}
                />
              )}
            </>
          )}
        </Flex>
      </Modal>

      <Modal
        title="Signature (EIP-712) Patner's Backend"
        open={isPartnersBackendModalOpen}
        onCancel={closePartnersBackendModalOpen}
        footer={null}
        maskClosable={false}
        destroyOnClose
        centered
      >
        <Flex align="center" justify="center" style={{ marginTop: 40 }}>
          {partnersBackendLoading && (
            <>
              {partnersBackendError == null && (
                <Flex align="center" gap="20px" vertical>
                  <LoadingOutlined style={{ fontSize: 40 }} />
                  <Typography.Text type="secondary">
                    Signing in progress
                  </Typography.Text>
                </Flex>
              )}
            </>
          )}
          {!partnersBackendLoading && (
            <>
              {partnersBackendError !== null ? (
                <Result
                  status="error"
                  title="Error!"
                  subTitle={partnersBackendError}
                  extra={[
                    <Button
                      type="primary"
                      onClick={closePartnersBackendModalOpen}
                      block
                    >
                      OK
                    </Button>,
                  ]}
                />
              ) : (
                <Result
                  status="success"
                  title="Success!"
                  subTitle="Now you can follow next step"
                  extra={[
                    <Button
                      type="primary"
                      onClick={closePartnersBackendModalOpen}
                      block
                    >
                      OK
                    </Button>,
                  ]}
                />
              )}
            </>
          )}
        </Flex>
      </Modal>

      <Modal
        title="Verification Process"
        open={isVerificationModalOpen}
        onCancel={closeVerificationModalHandler}
        footer={null}
        maskClosable={false}
        destroyOnClose
        centered
      >
        <Flex align="center" justify="center" style={{ marginTop: 40 }}>
          {verificationLoading && (
            <Flex align="center" gap="20px" vertical>
              <LoadingOutlined style={{ fontSize: 40 }} />
              <Typography.Text type="secondary">
                Verification in progress
              </Typography.Text>
            </Flex>
          )}

          {!verificationLoading && (
            <>
              {purefiError !== null ? (
                <div>
                  {isVerificationAllowed && (
                    <Result
                      status="warning"
                      title="Additional Verification Required"
                      subTitle="Proceed to PureFi Dashboard"
                      extra={
                        <Button
                          type="primary"
                          onClick={proceedToDashboard}
                          block
                        >
                          PureFi Dashboard <ExportOutlined />
                        </Button>
                      }
                    />
                  )}

                  {!isVerificationAllowed && (
                    <Result
                      status="error"
                      title="Error!"
                      subTitle={purefiError}
                      extra={[
                        <Button
                          type="primary"
                          onClick={closeVerificationModalHandler}
                          block
                        >
                          OK
                        </Button>,
                      ]}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <Result
                    status="success"
                    title="Success!"
                    subTitle="Now you can use obtained PureFi Package as a part of payload for Smart contract call"
                    extra={[
                      <Button
                        type="primary"
                        onClick={closeVerificationModalHandler}
                        block
                      >
                        OK
                      </Button>,
                    ]}
                  />
                </div>
              )}
            </>
          )}
        </Flex>
      </Modal>
    </div>
  );
};

export default Playground;
