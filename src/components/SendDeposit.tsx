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
  chosenSide: number
}

export function SendDeposit(props: Props) {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const connectedWallet = useConnectedWallet();

  const { chosenSide } = props

  const sendDeposit = useCallback(() => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);

    const side = chosenSide || 1

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { deposit: { side, amount: new BigNumber(depositAmount).shiftedBy(6).toString() } }
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
      {connectedWallet?.availablePost && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input className="retro-input" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} />
          <div className='button' onClick={() => sendDeposit()}>Deposit</div>
          {txResult}
          {txError}
        </div>
      )}
      {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
    </div>
  );
}
