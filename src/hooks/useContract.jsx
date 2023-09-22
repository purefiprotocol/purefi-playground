import { useRef, useState } from 'react';
import { ethers } from 'ethers';
import { errorCodes, serializeError } from 'eth-rpc-errors';
import { toast } from 'react-toastify';
import { zkSyncTestnet } from 'wagmi/chains';
import useWallet from './useWallet.js';
import {
  CONFIGURED_GAS_LIMIT_MULTIPLIERS,
  DEFAULT_GAS_LIMIT_MULTIPLIER,
  ZERO_ADDRESS,
} from '../config';
import { capitalizeFirstLetter } from '../utils';
import { TxnToastSuccess } from '../components';

const useContract = (contractData, functionName) => {
  const { provider, signer, chain } = useWallet();
  const toastRef = useRef();
  const [loading, setLoading] = useState(false);

  const contract = new ethers.Contract(
    contractData?.address || ZERO_ADDRESS,
    contractData?.abi || [],
    signer
  );

  const gasLimitMultiplier =
    CONFIGURED_GAS_LIMIT_MULTIPLIERS[chain.id] || DEFAULT_GAS_LIMIT_MULTIPLIER;

  const write = async (args, overrides) => {
    if (contract.address === ZERO_ADDRESS) {
      toast.error('Contract is not configured');
    } else if (!functionName) {
      toast.error("Contract's functionName is missing");
    } else if (!contract[functionName]) {
      toast.error('Contract is not configured properly');
    } else {
      try {
        setLoading(true);
        toastRef.current = toast.loading('Pending...');
        const theOverrides = overrides || {};

        if (chain.id !== zkSyncTestnet.id) {
          const estimatedGasLimit = await contract.estimateGas[functionName](
            ...args,
            theOverrides
          );

          const increasedGasLimit = estimatedGasLimit
            .mul(gasLimitMultiplier * 100)
            .div(100);

          const gasPrice = await provider.getGasPrice();

          theOverrides.gasLimit = increasedGasLimit;
          theOverrides.gasPrice = gasPrice;
        }

        const txn = await contract[functionName](...args);

        const response = await txn.wait();
        const url = `${chain.blockExplorers.default.url}/tx/${response.transactionHash}`;

        toast.success(<TxnToastSuccess url={url} />, {
          autoClose: false,
        });
      } catch (error) {
        const { code, data, message } = serializeError(error);

        let errorMessage = '';

        if (
          code === errorCodes.provider.userRejectedRequest ||
          ((code === errorCodes.rpc.invalidInput ||
            code === errorCodes.rpc.internal) &&
            (message.includes('reject') || message.includes('cancel')))
        ) {
          errorMessage = 'Transaction has been canceled';
        } else if (
          code === errorCodes.rpc.internal &&
          data?.message?.includes('insufficient funds')
        ) {
          errorMessage = 'You have insufficient funds to pay commission';
        } else if (data?.originalError?.reason) {
          errorMessage = capitalizeFirstLetter(data.originalError.reason);
        } else {
          errorMessage = message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
        toast.dismiss(toastRef.current);
      }
    }
  };

  return {
    contractLoading: loading,
    write,
  };
};

export default useContract;
