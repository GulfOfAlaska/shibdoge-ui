import { MsgExecuteContract, MsgSend, StdFee } from '@terra-money/terra.js';
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  useConnectedWallet,
  UserDenied,
} from '@terra-money/wallet-provider';
import { contractAddress } from 'constants/contractAddress';
import { useCallback, useState } from 'react';
import './componentStyle.css'

interface Props {
}

export function Withdraw(props: Props) {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const connectedWallet = useConnectedWallet();

  const sendWithdraw = useCallback(() => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { withdraw: { amount: withdrawAmount } }
    );

    connectedWallet
      .post({
        msgs: [execute],
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setTxResult(nextTxResult);
      })
      .catch((error: unknown) => {
        if (error instanceof UserDenied) {
          setTxError('User Denied');
        } else if (error instanceof CreateTxFailed) {
          setTxError('Create Tx Failed: ' + error.message);
        } else if (error instanceof TxFailed) {
          setTxError('Tx Failed: ' + error.message);
        } else if (error instanceof Timeout) {
          setTxError('Timeout');
        } else if (error instanceof TxUnspecifiedError) {
          setTxError('Unspecified Error: ' + error.message);
        } else {
          setTxError(
            'Unknown Error: ' +
            (error instanceof Error ? error.message : String(error)),
          );
        }
      });
  }, [connectedWallet]);

  return (
    <div>
      {connectedWallet?.availablePost && !txResult && !txError && (
        <div>
          <input value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} />
          <div className='button' onClick={() => sendWithdraw()}>Withdraw</div>
        </div>
      )}
      {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
    </div>
  );
}
