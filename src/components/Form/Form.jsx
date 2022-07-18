import { useState, useRef, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { signMessage } from '../../utils';
import { useBuyContract, useWallet } from '../../hooks';

const TheForm = () => {
  const signFormRef = useRef();
  const buyFormRef = useRef();
  const { account, networkId, activeNetwork } = useWallet();

  useEffect(() => {
    setAddress(account);
    setRuleId('431040');
    setMessage('');
    setClientSignature('');
    setResponseData(undefined);
    setResponseSignature('');
  }, [account]);

  const [address, setAddress] = useState('');
  const [ruleId, setRuleId] = useState('');
  const [chainId, setChainId] = useState('56');

  const [message, setMessage] = useState('');
  const [clientSignature, setClientSignature] = useState('');
  const [bnbValue, setBnbValue] = useState('0.001');

  const [signLoading, setSignLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const [responseData, setResponseData] = useState();
  const [responseSignature, setResponseSignature] = useState('');

  const [error, setError] = useState('');

  const {
    loading: buyLoading,
    buy,
    txnHash,
    txnError,
    clearTxnError,
  } = useBuyContract();

  const loading = signLoading || requestLoading || buyLoading;

  const dummyChangeHandler = () => {};

  const chainChangeHandler = (e) => {
    setChainId(Number(e.target.value));
    setMessage('');
    setClientSignature('');
  };

  const checkValidity = (theRef) => {
    const isValid = theRef.current.checkValidity();
    if (!isValid) {
      theRef.current.reportValidity();
    }
    return isValid;
  };

  const signMessageHandler = async (e) => {
    const isValid = checkValidity(signFormRef);

    if (isValid) {
      try {
        setSignLoading(true);

        const data = {
          address,
          ruleId: ruleId,
          chainId: Number(chainId),
        };

        const result = await signMessage(JSON.stringify(data));

        setMessage(result.message);
        setClientSignature(result.signature);
      } catch (error) {
        setError(error.message);
      } finally {
        setSignLoading(false);
      }
    }
  };

  const submitRequestHandler = async (e) => {
    try {
      setRequestLoading(true);

      const payload = {
        message,
        signature: clientSignature,
      };

      const response = await fetch(
        'https://issuer.app.purefi.io/api/aml/address/check',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const parsedResponse = await response.json();

      if (response.ok) {
        setError('');

        setResponseData(parsedResponse.data);
        setResponseSignature(parsedResponse.signature);
      } else {
        let errorMessage = parsedResponse.message;

        if (
          errorMessage.toLowerCase().includes('subscription required') ||
          errorMessage.toLowerCase().includes('subscription expired') ||
          errorMessage.toLowerCase().includes('for this month')
        ) {
          errorMessage +=
            '. Please, visit https://dashboard.purefi.io/subscription and subscribe';
        }
        setError(errorMessage);
      }
    } catch (error) {
      setResponseData('');
      setError(error.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const buyRequestHandler = async (e) => {
    const isValid = checkValidity(buyFormRef);
    if (isValid) {
      const payload = {
        target: address,
        value: Number(bnbValue),
        data: responseData,
        signature: responseSignature,
      };
      await buy(payload);
    }
  };

  if (!account) {
    return (
      <Container fluid className="mb-4">
        <div className="alert alert-primary mb-2" role="alert">
          Connect wallet to proceed
        </div>
      </Container>
    );
  }

  if (networkId !== activeNetwork.networkId) {
    return (
      <Container fluid className="mb-4">
        <div className="alert alert-primary mb-2" role="alert">
          Switch network to BNB Smart Chain (BEP-20)
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mb-4">
      {error && (
        <div className="alert alert-danger mb-2" role="alert">
          {error}
          <button
            type="button"
            className="close"
            data-dismiss="alert"
            aria-label="Close"
            onClick={() => setError('')}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {txnError && (
        <div className="alert alert-danger mb-2" role="alert">
          {txnError}
          <button
            type="button"
            className="close"
            data-dismiss="alert"
            aria-label="Close"
            onClick={() => clearTxnError()}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <Row>
        <Col xs={4}>
          <h4 className="mb-4">Input Data</h4>
          <Form ref={signFormRef}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="address">Target Address</Form.Label>
              <Form.Control
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={dummyChangeHandler}
                minLength="42"
                maxLength="42"
                placeholder="0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
                readOnly
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="ruleId">Rule Id</Form.Label>
              <Form.Control
                type="number"
                id="ruleId"
                name="ruleId"
                value={ruleId}
                onChange={dummyChangeHandler}
                step="1"
                min="431001"
                max="431100"
                placeholder="431040"
                readOnly
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="ruleId">Chain Id</Form.Label>
              <Form.Control
                as="select"
                name="chainId"
                aria-label="Default select example"
                value={chainId}
                onChange={chainChangeHandler}
                required
              >
                <option value="1">Ethereum</option>
                <option value="56">BNB Smart Chain</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Button
                variant="secondary"
                type="button"
                onClick={signMessageHandler}
                disabled={loading}
                block
              >
                Sign Message
              </Button>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="message">Generated message</Form.Label>
              <Form.Control
                id="message"
                as="textarea"
                rows={7}
                value={
                  message
                    ? JSON.stringify(JSON.parse(message), undefined, 2)
                    : ''
                }
                onChange={() => {}}
                required
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="clientSignature">Signature</Form.Label>
              <Form.Control
                id="clientSignature"
                as="textarea"
                rows={4}
                value={clientSignature}
                onChange={() => {}}
                required
                readOnly
              />
            </Form.Group>
            <Button
              variant="secondary"
              type="button"
              onClick={submitRequestHandler}
              disabled={loading || !message || !clientSignature}
              block
            >
              Submit request
            </Button>
          </Form>
        </Col>

        <Col xs={4}>
          <h4 className="mb-4">Issuer Response</h4>
          <Form ref={buyFormRef}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="bnbValue">Buy for BNB</Form.Label>
              <Form.Control
                id="bnbValue"
                type="number"
                value={bnbValue}
                onChange={(e) => setBnbValue(e.target.value)}
                min="0.001"
                step="0.001"
                placeholder="0.01"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="responseData">Data</Form.Label>
              <Form.Control
                id="responseData"
                as="textarea"
                rows={8}
                value={
                  responseData ? JSON.stringify(responseData, undefined, 2) : ''
                }
                onChange={() => {}}
                required
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="responseSignature">Signature</Form.Label>
              <Form.Control
                id="responseSignature"
                as="textarea"
                rows={4}
                value={responseSignature}
                onChange={() => {}}
                required
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Button
                variant="secondary"
                type="button"
                onClick={buyRequestHandler}
                disabled={loading || !responseData || !responseSignature}
                block
              >
                Buy
              </Button>
            </Form.Group>
          </Form>
        </Col>

        <Col xs={4}>
          <h4 className="mb-4">Buy Contract Response</h4>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="txnHash">Transaction hash</Form.Label>
              <Form.Control
                id="txnHash"
                type="text"
                value={txnHash}
                onChange={() => {}}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="txnHash">Transaction link</Form.Label>
              {txnHash && (
                <a
                  className="text-truncate ml-2"
                  href={`https://bscscan.com/tx/${txnHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BscScan
                </a>
              )}
            </Form.Group>
          </Form>

          <Form></Form>
        </Col>
      </Row>
    </Container>
  );
};

export default TheForm;
