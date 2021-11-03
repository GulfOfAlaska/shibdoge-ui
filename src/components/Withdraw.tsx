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
import BigNumber from 'bignumber.js';
import { contractAddress } from 'constants/contractAddress';
import { useCallback, useState } from 'react';
import './componentStyle.css'

interface Props {
  staked: string
}

export function Withdraw(props: Props) {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const connectedWallet = useConnectedWallet();

  const { staked } = props

  const sendWithdraw = async () => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);
    setTxError(null);

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { withdraw: { amount: new BigNumber(withdrawAmount).shiftedBy(6).toString() } }
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
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className='button' onClick={() => sendWithdraw()}>Withdraw</div>
        <div style={{ position: 'relative' }}>
          <input className="retro-input" value={withdrawAmount} onChange={(event) => { setWithdrawAmount(event.target.value) }} />
          {
            staked &&
            <div style={{ marginLeft: '1vw', fontWeight: 'bold', fontSize: '.5vw', textAlign: 'right', position: 'absolute', right: '.5vw', top: '-.8vw', cursor: 'pointer' }} onClick={() => { setWithdrawAmount(staked) }}>{`max: ${staked}`}</div>
          }
        </div>
        {txError}
      </div>
      {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
    </div>
  );
}
