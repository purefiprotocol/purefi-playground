import { FC, useEffect, useState } from 'react';
import {
  AbiFunction,
  BaseError,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  isHex,
  toFunctionSelector,
  toFunctionSignature,
  TransactionReceipt,
} from 'viem';
import {
  Form,
  Row,
  Col,
  Input,
  Modal,
  Flex,
  Typography,
  Button,
  Result,
  Select,
} from 'antd';
import { ExportOutlined, LoadingOutlined } from '@ant-design/icons';
import { checkIfChainSupported, getTransactionLink, sleep } from '@/utils';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { DEFAULT_CHAIN_VIEM } from '@/config';

interface SelectOption {
  label: string;
  value: string;
  data: string;
}

interface TransactionBuilderProps {
  contractAddress: string;
}

const TransactionBuilder: FC<TransactionBuilderProps> = (props) => {
  const { contractAddress = '' } = props;

  const account = useAccount();

  const isWalletConnected = account.isConnected;
  const isChainSupported = checkIfChainSupported(account.chainId);
  const isReady = isWalletConnected && isChainSupported;

  const publicClientConfig = {
    chain: isReady ? account.chain : DEFAULT_CHAIN_VIEM,
    transport: isReady ? custom((window as any).ethereum!) : http(),
  };

  const [transactionBuilderForm] = Form.useForm();
  const [paramsForm] = Form.useForm();

  useEffect(() => {
    transactionBuilderForm.setFields([
      {
        name: 'contractAddress',
        value: contractAddress,
      },
    ]);
  }, [contractAddress]);

  const contractAddressValue = Form.useWatch(
    'contractAddress',
    transactionBuilderForm
  );

  const [parsedAbi, setParsedAbi] = useState<AbiFunction[]>([]);

  const abiValue = Form.useWatch('abi', transactionBuilderForm);

  useEffect(() => {
    const newParsedAbi: AbiFunction[] = abiValue ? JSON.parse(abiValue) : [];
    setParsedAbi(newParsedAbi);
  }, [abiValue]);

  const methodValue = Form.useWatch('method', transactionBuilderForm);
  const paramsValue = Form.useWatch('params', paramsForm);

  const [isTransactionBuilderModalOpen, setIsTransactionBuilderModalOpen] =
    useState(false);
  const [transactionBuilderLoading, setTransactionBuilderLoading] =
    useState(false);

  const [transactionBuilderError, setTransactionBuilderError] = useState<
    string | null
  >(null);

  const [txnReceipt, setTxnReceipt] = useState<TransactionReceipt | null>(null);
  const [txnHash, setTxnHash] = useState<string | null>(null);

  const openTransactionBuilderModalHandler = () => {
    setIsTransactionBuilderModalOpen(true);
  };

  const closeTransactionBuilderModalHandler = () => {
    if (!transactionBuilderLoading) {
      setIsTransactionBuilderModalOpen(false);
      setTransactionBuilderError(null);
      setTxnReceipt(null);
      setTxnHash(null);
    }
  };

  const openTxnLink = (link: string) => {
    window.open(link, '_blank');
  };

  const validateTransactionBuilder = async () => {
    await paramsForm.validateFields({ recursive: true });
    await transactionBuilderForm.validateFields({ recursive: true });

    return true;
  };

  const transactionBuilderWriteHandler = async () => {
    try {
      if (isReady) {
        const isValid = await validateTransactionBuilder();

        if (isValid) {
          try {
            setTransactionBuilderLoading(true);

            openTransactionBuilderModalHandler();

            const walletClient = createWalletClient({
              chain: account.chain!,
              transport: custom((window as any).ethereum!),
            });

            const args: any[] = paramsValue.map((param: any) => {
              let value = param[param.name];
              const type = param.type;

              if (type.includes('uint')) {
                value = BigInt(value);
              } else if (type.includes('bool')) {
                value = value === '0' || value === 'false' ? false : true;
              }

              return value;
            });

            const methodItem = methodOptions.find(
              (item) => item.value === methodValue
            )!;

            const methodData = JSON.parse(methodItem.data);

            const methodName = methodData.name;

            const hash = await walletClient.writeContract({
              account: account.address!,
              address: contractAddressValue,
              abi: parsedAbi,
              functionName: methodName,
              args,
            });

            setTxnHash(hash);

            const publicClient = createPublicClient(publicClientConfig);

            const receipt = await publicClient.waitForTransactionReceipt({
              hash,
            });

            setTxnReceipt(receipt);
          } catch (error: unknown) {
            const theError = error as BaseError;
            setTxnReceipt(null);
            setTransactionBuilderError(theError.shortMessage);
          } finally {
            setTransactionBuilderLoading(false);
          }
        }
      } else {
        toast.warn('Either wallet not connected or chain is not supported');
      }
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const [methodOptions, setMethodOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const newOptions = parsedAbi
      .filter(
        (item) => item.type === 'function' && item.stateMutability !== 'view'
      )
      .map((item) => {
        const methodSignature = toFunctionSignature(item);
        const methodSelector = toFunctionSelector(methodSignature);

        const option: SelectOption = {
          label: `${item.name} (${methodSelector})`,
          value: methodSelector,
          data: JSON.stringify(item),
        };
        return option;
      });

    setMethodOptions(newOptions);

    if (newOptions.length > 0) {
      transactionBuilderForm.setFields([
        {
          name: 'method',
          value: newOptions[0].value,
        },
      ]);
    } else {
      transactionBuilderForm.resetFields(['method']);
    }
  }, [parsedAbi]);

  useEffect(() => {
    paramsForm.resetFields();

    if (methodValue && methodOptions.length > 0) {
      const theOption = methodOptions.find((option) => {
        return option.value === methodValue;
      });

      if (theOption) {
        const parsedData = JSON.parse(theOption.data);

        const { inputs } = parsedData;

        if (inputs) {
          paramsForm.setFields([
            {
              name: 'params',
              value: inputs,
            },
          ]);
        } else {
          transactionBuilderForm.setFields([
            {
              name: 'method',
              value: '',
            },
          ]);
        }
      } else {
        transactionBuilderForm.setFields([
          {
            name: 'method',
            value: '',
          },
        ]);
      }
    } else {
      transactionBuilderForm.setFields([
        {
          name: 'method',
          value: '',
        },
      ]);
    }
  }, [methodValue, methodOptions]);

  return (
    <>
      <Row gutter={[16, 8]}>
        <Col className="gutter-row" xs={24} lg={12}>
          <Form
            layout="vertical"
            form={transactionBuilderForm}
            initialValues={{
              contractAddress,
              abi: '',
              method: '',
            }}
            autoComplete="off"
          >
            <Form.Item
              label="Smart Contract (Address)"
              name="contractAddress"
              rules={[
                {
                  required: true,
                },
                {
                  pattern: /^(0x)[0-9a-fA-F]{40}$/,
                  message: 'Smart Contract (Address) Invalid',
                },
              ]}
              hasFeedback
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="ABI"
              name="abi"
              rules={[
                {
                  required: true,
                },
              ]}
              hasFeedback
            >
              <Input.TextArea autoSize={{ minRows: 4, maxRows: 6 }} />
            </Form.Item>

            <Form.Item
              label="Contract Method Selector"
              name="method"
              rules={[
                {
                  required: methodOptions.length > 0,
                },
              ]}
              hasFeedback
            >
              <Select options={methodOptions} />
            </Form.Item>
          </Form>

          <Form
            layout="vertical"
            form={paramsForm}
            initialValues={{
              params: [],
            }}
            autoComplete="off"
          >
            <Form.List name="params">
              {(fields) => (
                <div>
                  {fields.length > 0 ? (
                    fields.map((field) => {
                      const label = paramsValue[field.key].name;
                      const type = paramsValue[field.key].type;

                      const theLabel = `${label} (${type})`;

                      const theName = [field.name, paramsValue[field.key].name];

                      const theRules: any[] = [];

                      if (type === 'address') {
                        const requiredRule = {
                          required: true,
                        };
                        const addressRule = {
                          pattern: /^(0x)[0-9a-fA-F]{40}$/,
                          message: `${label} Invalid`,
                        };

                        theRules.push(requiredRule, addressRule);
                      } else if (type.includes('uint')) {
                        const uintRule = {
                          required: true,
                          validator: (rule: any, value: any) => {
                            if (!rule?.required) {
                              return Promise.resolve();
                            }

                            if (value === '') {
                              return Promise.reject(
                                new Error(`Please enter ${label}`)
                              );
                            }

                            if (+value <= 0 || isNaN(+value)) {
                              return Promise.reject(
                                new Error(`${label} must be positive numeric`)
                              );
                            }

                            return Promise.resolve();
                          },
                        };

                        theRules.push(uintRule);
                      } else if (type.includes('bytes')) {
                        const hexRule = {
                          required: true,
                          validator: (rule: any, value: any) => {
                            if (!rule?.required) {
                              return Promise.resolve();
                            }

                            if (value === '') {
                              return Promise.reject(
                                new Error(`Please enter ${label}`)
                              );
                            }

                            if (!isHex(value)) {
                              return Promise.reject(
                                new Error(`${label} must be valid hex`)
                              );
                            }

                            return Promise.resolve();
                          },
                        };

                        theRules.push(hexRule);
                      } else {
                        const requiredRule = {
                          required: true,
                        };

                        theRules.push(requiredRule);
                      }

                      return (
                        <Form.Item
                          key={field.key}
                          name={theName}
                          label={theLabel}
                          rules={theRules}
                          messageVariables={{ label }}
                          hasFeedback
                        >
                          <Input />
                        </Form.Item>
                      );
                    })
                  ) : (
                    <>{methodValue && <p>There are no parameters</p>}</>
                  )}
                </div>
              )}
            </Form.List>
          </Form>

          <Button
            type="primary"
            onClick={transactionBuilderWriteHandler}
            loading={transactionBuilderLoading}
            block
          >
            Write
          </Button>
        </Col>
      </Row>

      <Modal
        title="Transaction"
        open={isTransactionBuilderModalOpen}
        onCancel={closeTransactionBuilderModalHandler}
        footer={null}
        maskClosable={false}
        destroyOnClose
        centered
      >
        <Flex align="center" gap="20px" vertical style={{ marginTop: 40 }}>
          {transactionBuilderLoading && (
            <>
              {!txnHash ? (
                <Flex align="center" gap="20px" vertical>
                  <LoadingOutlined style={{ fontSize: 40 }} />
                  <Typography.Text type="secondary">
                    Proceed in your wallet
                  </Typography.Text>
                </Flex>
              ) : (
                <Flex align="center" gap="20px" vertical>
                  <LoadingOutlined style={{ fontSize: 40 }} />
                  <Typography.Text type="secondary">Pending...</Typography.Text>
                </Flex>
              )}
            </>
          )}

          {!transactionBuilderLoading && (
            <>
              {transactionBuilderError !== null ? (
                <Result
                  status="error"
                  title="Error!"
                  subTitle={transactionBuilderError}
                  extra={[
                    !!txnHash && (
                      <Button
                        style={{ marginBottom: 10 }}
                        type="link"
                        icon={<ExportOutlined />}
                        onClick={() =>
                          openTxnLink(
                            getTransactionLink(txnHash!, account.chain)
                          )
                        }
                      >
                        <span>TXN</span>
                      </Button>
                    ),
                    <Button
                      type="primary"
                      onClick={closeTransactionBuilderModalHandler}
                      block
                    >
                      OK
                    </Button>,
                  ]}
                />
              ) : (
                <Result
                  status={
                    txnReceipt?.status === 'success' ? 'success' : 'error'
                  }
                  title={
                    txnReceipt?.status === 'success' ? 'Success!' : 'Error!'
                  }
                  extra={[
                    <Button
                      style={{ marginBottom: 10 }}
                      type="link"
                      icon={<ExportOutlined />}
                      onClick={() =>
                        openTxnLink(getTransactionLink(txnHash!, account.chain))
                      }
                    >
                      <span>TXN</span>
                    </Button>,
                    <Button
                      type="primary"
                      onClick={closeTransactionBuilderModalHandler}
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
    </>
  );
};

export default TransactionBuilder;
