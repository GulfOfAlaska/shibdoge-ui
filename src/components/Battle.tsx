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

export function Battle() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [depositDogeAmount, setDepositDogeAmount] = useState<string | null>(null);
  const [depositShibaAmount, setDepositShibaAmount] = useState<string | null>(null);

  const connectedWallet = useConnectedWallet();

  const sendChoice = useCallback((side: number) => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { side: { side } }
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

  const sendDeposit = useCallback((side: number) => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { deposit: { side } }
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
    <div style={{ height: '100%', width: '70%', marginLeft: '1rem', padding: '5rem 0', position: 'relative' }}>
      {/* DOGE */}
      <div className='container' style={{ height: '45%', width: '100%' }}>
        <div className='doge-pict-container' style={{ right: '1rem' }} />
        {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ right: '1rem' }}>
            <div className='button' onClick={() => sendChoice(0)}>Choose Doge</div>
          </div>
        )}
      </div>

      <div className='vs-container' style={{ height: '10%', width: '10%' }} />

      {/* SHIBA */}
      <div className='container' style={{ height: '45%', width: '100%' }}>
        <div className='shiba-pict-container' style={{ right: '1rem' }} />
        {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ left: '1rem' }}>
            <div className='button' onClick={() => sendChoice(1)}>Choose Shib</div>
          </div>
        )}
      </div>



      {txResult && (
        <>
          <pre>{JSON.stringify(txResult, null, 2)}</pre>
          <div className='button' onClick={() => setTxResult(null)}>Clear Tx Result</div>
        </>
      )}
      {txError && (
        <>
          <pre>{txError}</pre>
          <div className='button' onClick={() => setTxError(null)}>Clear Tx Error</div>
        </>
      )}
      {!connectedWallet && <p>Wallet not connected!</p>}
      {connectedWallet && !connectedWallet.availablePost && (
        <p>Can not post Tx</p>
      )}
    </div>
  );
}
