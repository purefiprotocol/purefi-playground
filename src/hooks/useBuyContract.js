import { ethers } from 'ethers';
import { useCallback, useContext, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { errorCodes, serializeError } from 'eth-rpc-errors';
import ethereum from '../ethereum';
import { WalletContext } from '../context';

const useBuyContract = () => {
  const wallet = useContext(WalletContext);
  const queryClient = useQueryClient();
  const [txnHash, setTxnHash] = useState('');
  const [txnError, setTxnError] = useState('');

  const refetchQuery = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const handleError = useCallback(
    (error) => {
      const { code, data, message: rpcErrorMessage } = serializeError(error);

      if (code === errorCodes.provider.userRejectedRequest) {
        setTxnError('Transaction has been canceled');
      } else if (
        code === errorCodes.rpc.internal &&
        data?.message?.includes('insufficient funds')
      ) {
        // error message example
        // err: insufficient funds for gas * price + value: address 0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB have 61177490000000000 want 10000000000000000000 (supplied gas 10128300)
        let message = 'You have insufficient funds to pay commission';

        const strFeeInWei = data.message
          .split('want')[1]
          ?.trim()
          ?.split(' ')[0];

        const parsedFeeInWei = parseInt(strFeeInWei, 10);

        if (!Number.isNaN(parsedFeeInWei)) {
          const ethValue = Number(ethers.utils.formatEther(strFeeInWei));
          message += `. At least ${ethValue} ${wallet.activeNetwork.symbol} is required`;
        }

        setTxnError(message);
      } else {
        const message = rpcErrorMessage || 'Transaction error';
        setTxnError(`Transaction rejected: ${message}`);
      }
    },
    [wallet.activeNetwork.symbol]
  );

  const handleSuccess = useCallback(
    (transactionHash) => {
      refetchQuery();
      setTxnHash(transactionHash);
    },
    [refetchQuery]
  );

  const handleTransaction = useCallback(async (mutationFn) => {
    const transactionResponse = await mutationFn;
    await transactionResponse.wait();
    return transactionResponse.hash;
  }, []);

  const buy = useMutation(
    async (variables) => {
      const { target, value, data, signature, ruleType } = variables;
      setTxnHash('');
      setTxnError('');
      return handleTransaction(
        ethereum.buy(target, value, data, signature, ruleType)
      );
    },
    {
      onSuccess: handleSuccess,
      onError: handleError,
    }
  );

  return {
    loading: buy.isLoading,
    buy: buy.mutateAsync,
    txnHash,
    txnError,
    clearTxnError: useCallback(() => {
      setTxnError('');
    }, [setTxnError]),
  };
};

export default useBuyContract;
