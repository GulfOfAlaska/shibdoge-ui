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
  chosenSide: number,
  unclaimedMessage: string
}

export function Claim(props: Props) {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const connectedWallet = useConnectedWallet();
  const { chosenSide, unclaimedMessage } = props

  const sendDeposit = useCallback(() => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { deposit: { amount: 0, side: chosenSide } }
    );

    connectedWallet
      .post({
        msgs: [execute],
      })
      .then((nextTxResult: TxResult) => {
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className='button' onClick={() => sendDeposit()}>Claim</div>
          <div className='text' style={{marginLeft: '1rem'}}>{unclaimedMessage}</div>
        </div>
      )}
      {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
    </div>
  );
}
