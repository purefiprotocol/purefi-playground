import { useState, useRef, useEffect } from 'react';
import { PureFI, PureFIErrorCodes } from '@purefi/verifier-sdk';
import { parseFixed } from '@ethersproject/bignumber';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { errorCodes, serializeError } from 'eth-rpc-errors';
import { useWallet, useContract, useUrls } from '../../hooks';
import { capitalizeFirstLetter } from '../../utils';
import { Toggle } from '../Toggle';
import {
  SIGN_TYPE_OPTIONS,
  DEFAULT_SIGN_TYPE,
  CONTRACTS_DICTIONARY,
  DEFAULT_CUSTOM_SIGNER_URL,
  CONFIGURED_RULE_TYPES,
  DEFAULT_RULE_TYPE_VALUES,
  RULE_TYPE_OPTIONS,
  DEFAULT_RULE_TYPE,
  ZERO_ADDRESS,
} from '../../config';
import openSrc from '../../assets/icons/open.svg';

const getFunctionNameByRuleType = (ruleType) => {
  if (ruleType === CONFIGURED_RULE_TYPES.KYC) {
    return 'buyForWithKYC';
  }

  if (ruleType === CONFIGURED_RULE_TYPES.KYC_AGE) {
    return 'buyForWithAGEKYC';
  }

  if (ruleType === CONFIGURED_RULE_TYPES.KYC_COUNTRY) {
    return 'buyForWithCOUNTRYKYC';
  }

  if (ruleType === CONFIGURED_RULE_TYPES.KYC_COUNTRY_AGE) {
    return 'buyForWithCOUNTRYAGEKYC';
  }

  if (ruleType === CONFIGURED_RULE_TYPES.AML) {
    return 'buyForWithAML';
  }

  if (ruleType === CONFIGURED_RULE_TYPES.AML_KYC) {
    return 'buyForWithKYCAML';
  }

  if (ruleType === CONFIGURED_RULE_TYPES.AML_OPTIONAL_KYC) {
    return 'buyForWithOptionalKYCAML';
  }

  return '';
};

const TheForm = () => {
  const signFormRef = useRef();
  const contractFormRef = useRef();
  const toastRef = useRef();
  const { account, chain, signer } = useWallet();
  const urls = useUrls();

  const contractData = CONTRACTS_DICTIONARY[chain.id];

  const [signType, setSignType] = useState(DEFAULT_SIGN_TYPE);
  const [useCustomSigner, setUseCustomSigner] = useState(false);
  const [customSignerUrl, setCustomSignerUrl] = useState(
    DEFAULT_CUSTOM_SIGNER_URL
  );

  const [sender, setSender] = useState(account);
  const [receiver, setReceiver] = useState(
    contractData?.address || ZERO_ADDRESS
  );
  const [chainId, setChainId] = useState(chain.id);
  const [ruleType, setRuleType] = useState(DEFAULT_RULE_TYPE);

  const [ruleId, setRuleId] = useState(
    DEFAULT_RULE_TYPE_VALUES[DEFAULT_RULE_TYPE]
  );

  const [tokenAddress, setTokenAddress] = useState(
    contractData?.tokenAddress || ZERO_ADDRESS
  );
  const [amount, setAmount] = useState('0.01');
  const [dataPack, setDataPack] = useState({});
  const [purefiData, setPurefiData] = useState('');
  const [signature, setSignature] = useState('');

  const [signLoading, setSignLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const { contractLoading, write } = useContract(
    contractData,
    getFunctionNameByRuleType(ruleType)
  );

  const loading = signLoading || verifyLoading || contractLoading;

  useEffect(() => {
    if (useCustomSigner) {
      setCustomSignerUrl(DEFAULT_CUSTOM_SIGNER_URL);
    }
  }, [useCustomSigner]);

  useEffect(() => {
    if (!chain.unsupported) {
      setChainId(chain.id);
    }
  }, [chain]);

  useEffect(() => {
    setSender(account);
  }, [account]);

  useEffect(() => {
    setReceiver(contractData?.address || ZERO_ADDRESS);
    setTokenAddress(contractData?.tokenAddress || ZERO_ADDRESS);
  }, [contractData]);

  useEffect(() => {
    setRuleId(DEFAULT_RULE_TYPE_VALUES[ruleType]);
  }, [ruleType]);

  useEffect(() => {
    const pack = {
      sender,
      receiver,
      chainId: +chainId,
      ruleId,
    };

    if (ruleType === CONFIGURED_RULE_TYPES.AML_OPTIONAL_KYC) {
      pack.token = tokenAddress;
      pack.amount = parseFixed(amount.toString(), 18).toHexString();
    }
    setDataPack(pack);
  }, [ruleType, ruleId, chainId, receiver, sender, tokenAddress, amount]);

  useEffect(() => {
    setSignature('');
  }, [dataPack]);

  useEffect(() => {
    setPurefiData('');
  }, [signature]);

  const checkSignFormValidity = () => {
    const isValid = signFormRef.current.checkValidity();
    if (!isValid) {
      signFormRef.current.reportValidity();
    }
    return isValid;
  };

  const signMessageHandler = async (e) => {
    const isValid = checkSignFormValidity();

    if (isValid) {
      const message = JSON.stringify(dataPack);

      if (useCustomSigner) {
        // custom signer flow
        try {
          setSignLoading(true);
          toastRef.current = toast.loading('Pending...');

          const payload = {
            message,
          };

          const response = await fetch(customSignerUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            const { signature } = await response.json();
            setSignature(signature);
            toast.success('Success!');
          } else {
            const { error } = await response.json();
            const errorMessage = `Incorrect custom signer usage.\n${capitalizeFirstLetter(
              error
            )}`;
            toast.error(errorMessage);
          }
        } catch (error) {
          const errorMessage = `${error?.message}.\nHighly likely custom signer is offline`;
          toast.error(errorMessage);
        } finally {
          setSignLoading(false);
          toast.dismiss(toastRef.current);
        }
      } else {
        // injected signer flow
        try {
          setSignLoading(true);
          toastRef.current = toast.loading('Pending...');
          const signature = await signer.signMessage(message);
          setSignature(signature);
          toast.success('Success!');
        } catch (error) {
          const { code, data, message } = serializeError(error);
          let errorMessage = '';

          if (
            code === errorCodes.provider.userRejectedRequest ||
            ((code === errorCodes.rpc.invalidInput ||
              code === errorCodes.rpc.internal) &&
              (message.includes('reject') || message.includes('cancel')))
          ) {
            errorMessage = 'User denied message signature';
          } else {
            errorMessage = data?.originalError?.reason || message;
          }

          toast.error(capitalizeFirstLetter(errorMessage));
        } finally {
          setSignLoading(false);
          toast.dismiss(toastRef.current);
        }
      }
    }
  };

  const verifyHandler = async (e) => {
    try {
      setVerifyLoading(true);
      toastRef.current = toast.loading('Pending...');

      const payload = {
        message: JSON.stringify(dataPack),
        signature,
      };

      PureFI.setIssuerUrl(urls.issuer);
      const data = await PureFI.verifyRule(payload, signType);
      setPurefiData(data);
      toast.success('Success!');
    } catch (error) {
      if (error.code === PureFIErrorCodes.FORBIDDEN) {
        const url = `${urls.dashboard}/kyc`;
        toast.warn(
          <div>
            <div className="mr-2">{error.message}</div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: '#25A2E9',
              }}
            >
              <span style={{ marginRight: 5 }}>Dashboard</span>
              <img height="12px" src={openSrc} alt="open" />
            </a>
          </div>,
          {
            autoClose: false,
          }
        );
      } else {
        toast.error(error.message);
      }
    } finally {
      setVerifyLoading(false);
      toast.dismiss(toastRef.current);
    }
  };

  const customSignerUrlClassName = classNames({
    'form-control': true,
    invisible: !useCustomSigner,
  });

  const tokenAddressFormGroupClassName = classNames({
    'form-group': true,
    'd-none': ruleType !== CONFIGURED_RULE_TYPES.AML_OPTIONAL_KYC,
  });

  const checkContractFormValidity = () => {
    return true;
  };

  const contractMethodHandler = (e) => {
    const isValid = checkContractFormValidity();

    if (isValid) {
      // args depend on contract method interface
      // https://docs.ethers.org/v5/api/contract/contract/#contract-functionsSend
      const args = [sender, purefiData];
      const overrides = { value: parseFixed(amount.toString(), 18).toString() };

      write(args, overrides);
    }
  };

  return (
    <div className="row justify-content-md-center">
      <div className="col col-xs-12 col-md-8 mb-4">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Demo Settings</h4>
          </div>
          <div className="card-body">
            <form>
              <div className="form-group">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label" htmlFor="signType">
                      Issuer Signature Type
                    </label>
                  </div>
                  <div className="col-9">
                    <Toggle
                      name="signType"
                      value={signType}
                      options={SIGN_TYPE_OPTIONS}
                      onChange={(e) => !loading && setSignType(e.target.value)}
                      readOnly={loading}
                      flex
                    />
                  </div>
                </div>
              </div>
              <hr />
              <div className="form-group mb-0">
                <div className="row align-items-center">
                  <div className="col-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="useCustomSigner"
                        value={useCustomSigner}
                        checked={useCustomSigner}
                        onChange={(e) =>
                          !loading && setUseCustomSigner(e.target.checked)
                        }
                        readOnly={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="useCustomSigner"
                      >
                        Use Custom Signer
                      </label>
                    </div>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className={customSignerUrlClassName}
                      id="customSignerUrl"
                      name="customSignerUrl"
                      value={customSignerUrl}
                      onChange={(e) => setCustomSignerUrl(e.target.value)}
                      placeholder="custom signer url"
                      required={useCustomSigner}
                      readOnly={loading}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col col-xs-12 col-md-8 mb-4">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Input Data</h4>
          </div>
          <div className="card-body">
            <form ref={signFormRef}>
              <div className="form-group">
                <div className="row align-items-start">
                  <div className="col-3">
                    <label className="form-label" htmlFor="sender">
                      Sender
                    </label>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="sender"
                      name="sender"
                      value={sender}
                      onChange={() => {}}
                      minLength="42"
                      maxLength="42"
                      placeholder="0x address"
                      readOnly
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row align-items-start">
                  <div className="col-3">
                    <label className="form-label mb-0" htmlFor="receiver">
                      Receiver
                    </label>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="receiver"
                      name="receiver"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      minLength="42"
                      maxLength="42"
                      placeholder="0x receiver address"
                      required
                      readOnly={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row align-items-center">
                  <div className="col-3">
                    <label className="form-label" htmlFor="chainId">
                      Chain Id
                    </label>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="chainId"
                      name="chainId"
                      value={chainId}
                      onChange={() => {}}
                      placeholder="chain id"
                      readOnly
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label" htmlFor="ruleType">
                      Rule Type
                    </label>
                  </div>
                  <div className="col-9">
                    <Toggle
                      name="ruleType"
                      value={ruleType}
                      options={RULE_TYPE_OPTIONS}
                      onChange={(e) => !loading && setRuleType(+e.target.value)}
                      readOnly={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row align-items-center">
                  <div className="col-3">
                    <label className="form-label" htmlFor="ruleId">
                      Rule Id
                    </label>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="ruleId"
                      name="ruleId"
                      value={ruleId}
                      onChange={() => {}}
                      placeholder="rule id"
                      readOnly
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={tokenAddressFormGroupClassName}>
                <div className="row align-items-center">
                  <div className="col-3">
                    <label className="form-label" htmlFor="tokenAddress">
                      Token Address
                    </label>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      id="tokenAddress"
                      name="tokenAddress"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      minLength="42"
                      maxLength="42"
                      placeholder="contract token address"
                      required={
                        ruleType === CONFIGURED_RULE_TYPES.AML_OPTIONAL_KYC
                      }
                      readOnly={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label" htmlFor="amount">
                      Amount
                    </label>
                  </div>
                  <div className="col-9">
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(+e.target.value)}
                      min="0.001"
                      step="0.001"
                      placeholder="0.001"
                      required
                      readOnly={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label" htmlFor="dataPack">
                      DataPack / Message
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      className="form-control"
                      id="dataPack"
                      name="dataPack"
                      value={JSON.stringify(dataPack, undefined, 2)}
                      onChange={() => {}}
                      rows={Math.max(6, Object.keys(dataPack).length + 2)}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label" htmlFor="signature">
                      Signature
                    </label>
                  </div>
                  <div className="col-9">
                    <textarea
                      className="form-control"
                      id="signature"
                      name="signature"
                      value={signature}
                      onChange={() => {}}
                      rows={3}
                      required
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="form-group mb-0">
                <div className="row justify-content-center mb-2">
                  <div className="col-3">
                    <button
                      className="btn btn-dark btn-block"
                      type="button"
                      onClick={signMessageHandler}
                      disabled={loading}
                    >
                      1. Sign
                    </button>
                  </div>
                </div>
                <div className="row justify-content-center">
                  <div className="col-3">
                    <button
                      className="btn btn-dark btn-block"
                      type="button"
                      onClick={verifyHandler}
                      disabled={loading || !signature}
                    >
                      2. Verify
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col col-xs-12 col-md-8 mb-4">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Issuer Response</h4>
          </div>
          <div className="card-body">
            <form ref={contractFormRef}>
              <div className="form-group">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label">Amount</label>
                  </div>
                  <div className="col-9">
                    <input
                      type="text"
                      className="form-control"
                      value={amount}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-3">
                    <label className="form-label" htmlFor="purefiData">
                      PureFI Data
                    </label>
                    <div>
                      <span className="badge badge-pill badge-dark py-2 px-3">
                        {signType}
                      </span>
                    </div>
                  </div>
                  <div className="col-9">
                    <textarea
                      className="form-control"
                      id="purefiData"
                      value={purefiData}
                      onChange={() => {}}
                      rows={6}
                      required
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="form-group mb-0">
                <div className="row justify-content-center">
                  <div className="col-3">
                    <button
                      className="btn btn-dark btn-block"
                      type="button"
                      onClick={contractMethodHandler}
                      disabled={loading || !purefiData}
                    >
                      3. Write
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheForm;
